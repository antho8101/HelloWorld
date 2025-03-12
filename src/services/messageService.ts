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
    console.warn('fetchMessages called with empty conversationId');
    return [];
  }
  
  try {
    console.log('Fetching messages for conversation:', conversationId);
    
    // Check authentication status
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      console.error('No authenticated session found');
      toast.error("You must be logged in to view messages");
      return [];
    }
    
    // Instead of checking the conversation_participants table with RLS policies that cause recursion,
    // Let's directly fetch the messages and apply client-side permission check
    
    // First, check if the user is part of this conversation with a direct query
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .select(`
        id,
        conversation_participants!inner(user_id)
      `)
      .eq('id', conversationId)
      .eq('conversation_participants.user_id', authData.session.user.id)
      .maybeSingle();
      
    if (conversationError) {
      console.error('Error checking conversation access:', conversationError);
      throw conversationError;
    }
    
    if (!conversationData) {
      console.error('User does not have access to this conversation');
      toast.error("You don't have access to this conversation");
      return [];
    }
    
    // Now fetch the messages directly from the messages table
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('id, content, created_at, sender_id, conversation_id')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      throw messagesError;
    }

    console.log(`Fetched ${messagesData?.length || 0} messages for conversation ${conversationId}`);
    
    if (!messagesData || messagesData.length === 0) {
      console.log('No messages found for conversation:', conversationId);
      return [];
    }
    
    // Get profiles for senders
    const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
    
    // Verify that senderIds does not contain null values
    const validSenderIds = senderIds.filter(id => id !== null);
    
    let profilesMap = new Map();
    if (validSenderIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", validSenderIds);
        
      if (profilesError) {
        console.error('Error fetching sender profiles:', profilesError);
        // Continue without profile data rather than failing completely
      }
      
      // Create profiles map
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, {
            name: profile.name,
            avatar_url: profile.avatar_url
          });
        });
      }
    }

    // Map messages with sender data
    const mappedMessages = messagesData.map(msg => {
      const senderProfile = profilesMap.get(msg.sender_id);
      return {
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender_name: senderProfile?.name || null,
        sender_avatar: senderProfile?.avatar_url || null
      };
    });
    
    return mappedMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const sendMessage = async (
  messageData: MessagePayload
): Promise<Message | null> => {
  try {
    console.log('Sending message to conversation:', messageData.conversation_id);
    
    const { data, error: messageError } = await supabase
      .from("messages")
      .insert(messageData)
      .select('id, content, created_at, sender_id')
      .single();

    if (messageError) {
      console.error('Error sending message:', messageError);
      throw messageError;
    }

    if (!data) {
      throw new Error('No data returned from message insertion');
    }

    console.log('Message sent successfully to conversation:', messageData.conversation_id);

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
    toast.error("Error sending message");
    return null;
  }
};
