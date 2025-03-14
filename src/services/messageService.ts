
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Message } from "@/types/messages";
import { updateConversationTimestamp } from "@/services/conversation";

interface MessagePayload {
  content: string;
  conversation_id: string;
  sender_id: string;
}

export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  if (!conversationId) {
    console.error('fetchMessages called with empty conversationId');
    return [];
  }
  
  try {
    console.log(`Fetching messages for conversation: ${conversationId}`);
    
    // First verify we have a logged-in user
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error('No authenticated session found', sessionError);
      return [];
    }
    
    const currentUserId = sessionData.session.user.id;
    console.log('Current user ID:', currentUserId);
    
    // Verify the user is a participant in this conversation
    const { data: participantCheck, error: participantError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId)
      .limit(1);
      
    if (participantError) {
      console.error('Error checking participant access:', participantError);
      return [];
    }
    
    if (!participantCheck || participantCheck.length === 0) {
      console.error('User is not a participant in this conversation');
      toast.error("You don't have access to this conversation");
      return [];
    }
    
    console.log('User confirmed as participant in conversation, fetching messages');
    
    // Now fetch messages directly with a service role approach
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return [];
    }
    
    if (!messagesData || messagesData.length === 0) {
      console.log('No messages found for conversation:', conversationId);
      return [];
    }
    
    console.log(`Retrieved ${messagesData.length} messages from database:`, messagesData);
    
    // Get all the unique sender IDs to fetch profiles in one request
    const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
    
    // Fetch all profiles for the senders in a single request
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', senderIds);
    
    if (profilesError) {
      console.error('Error fetching sender profiles:', profilesError);
    }
    
    // Create a map of profiles for easy lookup
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, {
          name: profile.name,
          avatar_url: profile.avatar_url
        });
      });
    }
    
    // Map the messages with sender info
    const formattedMessages: Message[] = messagesData.map(msg => {
      const profile = profileMap.get(msg.sender_id);
      return {
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender_name: profile ? profile.name : null,
        sender_avatar: profile ? profile.avatar_url : null
      };
    });
    
    console.log('Final formatted messages:', formattedMessages);
    return formattedMessages;
  } catch (error) {
    console.error("Error in fetchMessages service:", error);
    return [];
  }
};

export const sendMessage = async (
  messageData: MessagePayload
): Promise<Message | null> => {
  try {
    console.log('Sending message to conversation:', messageData.conversation_id);
    
    // First verify if user is a participant
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData.session?.user.id;
    
    if (!currentUserId || currentUserId !== messageData.sender_id) {
      console.error('User not authenticated or sender ID mismatch');
      return null;
    }
    
    // Verify the user is a participant in this conversation
    const { data: participantCheck, error: participantError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', messageData.conversation_id)
      .eq('user_id', currentUserId)
      .limit(1);
      
    if (participantError || !participantCheck || participantCheck.length === 0) {
      console.error('User is not a participant in this conversation');
      return null;
    }
    
    // Send the message
    const { data, error: messageError } = await supabase
      .from("messages")
      .insert(messageData)
      .select('id, content, created_at, sender_id')
      .single();

    if (messageError) {
      console.error('Error sending message:', messageError);
      throw new Error(`Could not send message: ${messageError.message}`);
    }

    if (!data) {
      console.error('No data returned from message insertion');
      throw new Error('Could not send message: No data returned');
    }

    console.log('Message sent successfully:', data);

    // Update the timestamp on the conversation
    await updateConversationTimestamp(messageData.conversation_id);

    // Get sender profile information
    const { data: profileData } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", messageData.sender_id)
      .single();

    // Return the complete message object
    return {
      id: data.id,
      content: data.content,
      created_at: data.created_at,
      sender_id: data.sender_id,
      sender_name: profileData?.name || null,
      sender_avatar: profileData?.avatar_url || null
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
