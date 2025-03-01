
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Conversation } from "@/types/messages";

export const fetchConversations = async (currentUserId: string | null): Promise<Conversation[]> => {
  if (!currentUserId) return [];

  try {
    const { data, error } = await supabase
      .from("conversation_participants")
      .select(`
        conversation_id,
        conversation:conversations!inner(
          id,
          created_at,
          updated_at,
          is_pinned,
          is_archived
        )
      `)
      .eq("user_id", currentUserId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    // Get all conversation IDs
    const conversationIds = data.map(item => item.conversation_id);

    // For each conversation, find the other participant
    const conversationsWithParticipants: Conversation[] = [];

    for (const conversationId of conversationIds) {
      // Get other participants for this conversation
      const { data: participantsData, error: participantsError } = await supabase
        .from("conversation_participants")
        .select(`
          user_id,
          profiles:profiles(
            id,
            name,
            avatar_url
          )
        `)
        .eq("conversation_id", conversationId)
        .neq("user_id", currentUserId);

      if (participantsError) {
        console.error("Error fetching participants:", participantsError);
        continue;
      }

      const conversationInfo = data.find(item => item.conversation_id === conversationId)?.conversation;
      
      if (!conversationInfo) continue;

      // Get the other participant's profile
      const otherParticipant = participantsData.length > 0 ? participantsData[0].profiles : null;
      let participantProfile = null;

      if (otherParticipant && typeof otherParticipant === 'object') {
        // Make sure this is not a SelectQueryError by checking for expected properties
        if ('id' in otherParticipant) {
          participantProfile = {
            id: otherParticipant?.id || null,
            name: otherParticipant?.name || null,
            avatar_url: otherParticipant?.avatar_url || null
          };
        }
      }

      conversationsWithParticipants.push({
        id: conversationId,
        created_at: conversationInfo.created_at,
        updated_at: conversationInfo.updated_at,
        is_pinned: conversationInfo.is_pinned,
        is_archived: conversationInfo.is_archived,
        otherParticipant: participantProfile
      });
    }

    // Sort conversations by updated_at (newest first)
    conversationsWithParticipants.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return conversationsWithParticipants;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    toast("Error loading conversations");
    return [];
  }
};

export const updateConversationTimestamp = async (conversationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    if (error) console.error("Error updating conversation timestamp:", error);
  } catch (error) {
    console.error("Error updating conversation timestamp:", error);
  }
};

export const createConversation = async (currentUserId: string, receiverId: string): Promise<string | null> => {
  try {
    // Create a new conversation
    const { data: newConv, error: convError } = await supabase
      .from("conversations")
      .insert({})
      .select("id")
      .single();

    if (convError) throw convError;
    
    const conversationId = newConv.id;

    // Add participants to the conversation
    const participants = [
      { conversation_id: conversationId, user_id: currentUserId },
      { conversation_id: conversationId, user_id: receiverId }
    ];

    const { error: participantsError } = await supabase
      .from("conversation_participants")
      .insert(participants);

    if (participantsError) throw participantsError;

    return conversationId;
  } catch (error) {
    console.error("Error creating conversation:", error);
    toast("Error creating conversation");
    return null;
  }
};
