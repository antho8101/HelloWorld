
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

    // Use the get_conversation_messages function to retrieve messages
    const { data: messagesData, error: messagesError } = await supabase
      .rpc('get_conversation_messages', { p_conversation_id: conversationId });
    
    if (messagesError) {
      console.error('[messageService] Error fetching messages:', messagesError);
      return [];
    }
    
    if (!messagesData) {
      console.log('[messageService] No messages data returned from query');
      return [];
    }
    
    console.log(`[messageService] Retrieved ${messagesData.length} messages from database`);
    
    // Format messages for the application
    const formattedMessages: Message[] = messagesData.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      created_at: msg.created_at,
      sender_id: msg.sender_id,
      sender_name: msg.sender_name || null,
      sender_avatar: msg.sender_avatar || null
    }));
    
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
    
    // Make sure we're using the right parameters for the RPC call
    const { data, error: messageError } = await supabase
      .rpc('send_message', {
        p_content: messageData.content,
        p_conversation_id: messageData.conversation_id
      });

    if (messageError) {
      console.error('Error sending message:', messageError);
      throw new Error(`Could not send message: ${messageError.message}`);
    }

    if (!data || data.length === 0) {
      console.error('No data returned from message insertion');
      throw new Error('Could not send message: No data returned');
    }

    console.log('Message sent successfully, data:', data);

    // Since the RPC function returns the new message, we can directly extract the data
    const newMessage = data[0];
    
    // Update the timestamp on the conversation
    await updateConversationTimestamp(messageData.conversation_id);

    // For compatibility with the UI, get the sender profile information
    const { data: profileData } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", messageData.sender_id)
      .single();

    // Return the complete message object
    return {
      id: newMessage.id,
      content: newMessage.content,
      created_at: newMessage.created_at,
      sender_id: newMessage.sender_id,
      sender_name: profileData?.name || null,
      sender_avatar: profileData?.avatar_url || null
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
