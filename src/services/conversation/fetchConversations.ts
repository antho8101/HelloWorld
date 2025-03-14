
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Conversation } from "@/types/messages";

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    console.log("Fetching conversations for user ID:", userId);
    
    // Utiliser la fonction sécurisée pour récupérer les conversations
    const { data: conversations, error: conversationsError } = await supabase.rpc(
      'get_user_conversations',
      { p_user_id: userId }
    );

    if (conversationsError) {
      console.error("Error fetching conversations via RPC:", conversationsError);
      throw conversationsError;
    }

    console.log("Fetched conversations data:", conversations ? conversations.length : 0);
    
    if (!conversations || conversations.length === 0) {
      console.log("No conversations found for user");
      return [];
    }

    // Transformer les données pour correspondre à notre structure Conversation
    const formattedConversations: Conversation[] = conversations.map(convo => ({
      id: convo.id,
      created_at: convo.created_at,
      updated_at: convo.updated_at,
      is_pinned: false, // Default values since these fields don't exist in DB anymore
      is_archived: false, // Default values since these fields don't exist in DB anymore
      otherParticipant: convo.other_user_id ? {
        id: convo.other_user_id,
        name: convo.other_user_name,
        avatar_url: convo.other_user_avatar,
        is_online: false // Will be updated by online status hook
      } : null,
      isTemporary: false,
      latest_message: convo.last_message,
      latest_message_time: convo.last_message_time,
      unread_count: convo.unread_count || 0
    }));

    return formattedConversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    toast.error("Error loading conversations");
    return [];
  }
};
