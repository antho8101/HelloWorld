
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
    
    // First, fetch the messages without joining profiles
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select(`
        id,
        content,
        created_at,
        sender_id,
        conversation_id
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      throw messagesError;
    }

    console.log(`Fetched ${messagesData?.length || 0} messages for conversation ${conversationId}`);
    
    if (!messagesData || messagesData.length === 0) {
      return [];
    }
    
    // Get unique sender IDs to fetch their profiles
    const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
    
    // Fetch profiles for all senders in one query
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", senderIds);
      
    if (profilesError) {
      console.error('Error fetching sender profiles:', profilesError);
      // Continue without profile data rather than failing completely
    }
    
    // Create a map for quick profile lookup
    const profilesMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap.set(profile.id, {
          name: profile.name,
          avatar_url: profile.avatar_url
        });
      });
    }

    // Map messages with sender data
    return messagesData.map(msg => {
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
  } catch (error) {
    console.error("Error fetching messages:", error);
    toast.error("Error loading messages");
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
