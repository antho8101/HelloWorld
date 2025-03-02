
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Message } from "@/types/messages";
import { updateConversationTimestamp } from "./conversationService";

interface MessagePayload {
  content: string;
  conversation_id: string;
  sender_id: string;
}

export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  if (!conversationId) return [];
  
  try {
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

    if (error) throw error;

    const fetchedMessages: Message[] = data.map(item => {
      // Check if sender exists and has expected properties to avoid SelectQueryError issues
      let senderName = null;
      let senderAvatar = null;
      
      if (item.sender && typeof item.sender === 'object' && !('code' in item.sender)) {
        // Use ! non-null assertion after we've checked that item.sender is not null
        senderName = item.sender!.name ?? null;
        senderAvatar = item.sender!.avatar_url ?? null;
      }
      
      return {
        id: item.id,
        content: item.content,
        created_at: item.created_at,
        sender_id: item.sender_id,
        sender_name: senderName,
        sender_avatar: senderAvatar
      };
    });

    return fetchedMessages;
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
    const { error: messageError } = await supabase
      .from("messages")
      .insert(messageData);

    if (messageError) throw messageError;

    // Update the timestamp on the conversation
    await updateConversationTimestamp(messageData.conversation_id);

    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    toast("Error sending message");
    return false;
  }
};
