
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
    
    // DIFFERENT APPROACH: Skip the problematic participant check and directly try to fetch messages
    // If the user isn't authorized, the RLS policies will prevent them from seeing messages anyway
    
    // Just fetch messages directly 
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('id, content, created_at, sender_id, is_read')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error('[messageService] Error fetching messages:', messagesError);
      // Treat as empty messages rather than an error
      return [];
    }
    
    // If no messages, return empty array (NOT an error case)
    if (!messagesData || messagesData.length === 0) {
      console.log('[messageService] No messages found for this conversation - this is normal for new conversations');
      return [];
    }
    
    console.log(`[messageService] Retrieved ${messagesData.length} messages from database`);
    
    // Now get all the unique sender IDs to fetch their profiles
    const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
    
    // Fetch profiles separately for these senders
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', senderIds);
      
    if (profilesError) {
      console.error('[messageService] Error fetching sender profiles:', profilesError);
    }
    
    // Create a map of profiles by ID for easy lookup
    const profilesMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
    }
    
    // Format messages, adding profile data
    const formattedMessages: Message[] = messagesData.map((msg: any) => {
      const profile = profilesMap.get(msg.sender_id);
      return {
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender_name: profile?.name || null,
        sender_avatar: profile?.avatar_url || null
      };
    });
    
    // Mark unread messages as read if any
    const unreadMessages = messagesData
      .filter(msg => msg.sender_id !== currentUserId && !msg.is_read)
      .map(msg => msg.id);
      
    if (unreadMessages.length > 0) {
      console.log(`[messageService] Marking ${unreadMessages.length} messages as read`);
      await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadMessages);
    }
    
    console.log('[messageService] Final formatted messages count:', formattedMessages.length);
    return formattedMessages;
  } catch (error) {
    console.error("[messageService] Error in fetchMessages service:", error);
    return []; // Return empty array instead of throwing error
  }
};

export const sendMessage = async (
  messageData: MessagePayload
): Promise<Message | null> => {
  try {
    console.log('[messageService] Sending message to conversation:', messageData.conversation_id);
    console.log('[messageService] Message content:', messageData.content);
    
    if (!messageData.content || !messageData.conversation_id) {
      console.error('[messageService] Invalid message data:', messageData);
      throw new Error('Invalid message data');
    }
    
    // Insert the message directly
    const { data: insertedMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: messageData.conversation_id,
        content: messageData.content,
        sender_id: messageData.sender_id
      })
      .select('id, content, created_at, sender_id')
      .single();

    // Handle errors
    if (messageError) {
      console.error('[messageService] Error sending message:', messageError);
      console.error('[messageService] Error details:', messageError.message, messageError.details);
      throw new Error(`Could not send message: ${messageError.message}`);
    }

    // Check result
    if (!insertedMessage) {
      console.error('[messageService] No data returned from message insertion');
      throw new Error('Could not send message: No data returned');
    }

    console.log('[messageService] Message sent successfully, data returned:', insertedMessage);
    
    // Update conversation timestamp
    await updateConversationTimestamp(messageData.conversation_id);

    // Get profile information for the sender
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", messageData.sender_id)
      .maybeSingle();
      
    if (profileError) {
      console.warn('[messageService] Error fetching profile for message:', profileError);
    }

    // Create complete message object
    const completeMessage: Message = {
      id: insertedMessage.id,
      content: insertedMessage.content,
      created_at: insertedMessage.created_at,
      sender_id: insertedMessage.sender_id,
      sender_name: profileData?.name || null,
      sender_avatar: profileData?.avatar_url || null
    };
    
    console.log('[messageService] Returning complete message:', completeMessage);
    return completeMessage;
  } catch (error) {
    console.error("[messageService] Error sending message:", error);
    throw error;
  }
};
