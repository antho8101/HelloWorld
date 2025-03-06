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
  if (!conversationId) return [];
  
  try {
    console.log('Fetching messages for conversation:', conversationId);
    
    const { data, error } = await supabase
      .from("messages")
      .select(`
        id,
        content,
        created_at,
        sender_id,
        sender:profiles(
          name,
          avatar_url
        )
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} messages for conversation ${conversationId}`);

    // Transform the data into properly typed Message objects
    return (data || []).map(item => {
      // Default values
      let senderName = null;
      let senderAvatar = null;
      
      // Safely extract sender data with proper type checking
      if (item.sender) {
        // If sender is an array (which can happen with Supabase joins), take the first item
        const senderData = Array.isArray(item.sender) ? item.sender[0] : item.sender;
        
        // Now safely extract properties
        if (senderData && typeof senderData === 'object') {
          senderName = 'name' in senderData ? senderData.name : null;
          senderAvatar = 'avatar_url' in senderData ? senderData.avatar_url : null;
        }
      }
      
      // Return a properly typed Message object
      return {
        id: item.id,
        content: item.content,
        created_at: item.created_at,
        sender_id: item.sender_id,
        sender_name: senderName,
        sender_avatar: senderAvatar
      };
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    toast("Error loading messages");
    return [];
  }
};

export const sendMessage = async (
  messageData: MessagePayload
): Promise<boolean> => {
  try {
    console.log('Sending message to conversation:', messageData.conversation_id);
    
    const { error: messageError } = await supabase
      .from("messages")
      .insert(messageData);

    if (messageError) {
      console.error('Error sending message:', messageError);
      throw messageError;
    }

    console.log('Message sent successfully to conversation:', messageData.conversation_id);

    // Update the timestamp on the conversation
    await updateConversationTimestamp(messageData.conversation_id);

    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    toast("Error sending message");
    return false;
  }
};
