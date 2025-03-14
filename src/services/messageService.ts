
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
    console.log(`[messageService] Fetching messages for conversation: ${conversationId}`);
    
    // First verify we have a logged-in user
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error('[messageService] No authenticated session found', sessionError);
      return [];
    }
    
    const currentUserId = sessionData.session.user.id;
    console.log('[messageService] Current user ID:', currentUserId);

    // Direct query using RLS policies
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error('[messageService] Error fetching messages:', messagesError);
      return [];
    }
    
    if (!messagesData) {
      console.log('[messageService] No messages data returned from query');
      return [];
    }
    
    console.log(`[messageService] Retrieved ${messagesData.length} messages from database`);
    
    // Get all the unique sender IDs to fetch profiles in one request
    const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
    
    // Fetch all profiles for the senders in a single request
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', senderIds);
    
    if (profilesError) {
      console.error('[messageService] Error fetching sender profiles:', profilesError);
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
    
    console.log('[messageService] Final formatted messages count:', formattedMessages.length);
    return formattedMessages;
  } catch (error) {
    console.error("[messageService] Error in fetchMessages service:", error);
    return [];
  }
};

export const sendMessage = async (
  messageData: MessagePayload
): Promise<Message | null> => {
  try {
    console.log('Sending message to conversation:', messageData.conversation_id);
    
    // First validate that the user is part of the conversation
    const { data: participantCheck, error: participantError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', messageData.conversation_id)
      .eq('user_id', messageData.sender_id)
      .single();
    
    if (participantError || !participantCheck) {
      console.error('Error verifying conversation participation:', participantError);
      throw new Error('You are not a participant in this conversation');
    }
    
    // Now send the message
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
