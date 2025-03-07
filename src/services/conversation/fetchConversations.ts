import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Conversation } from "@/types/messages";

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    console.log("Fetching conversations for user ID:", userId);
    
    const { data: participations, error: participationsError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);

    if (participationsError) {
      console.error("Error fetching conversation participations:", participationsError);
      throw participationsError;
    }

    console.log("Fetched participations:", participations ? participations.length : 0);

    if (!participations || participations.length === 0) {
      console.log("No conversations found for user");
      return [];
    }

    const conversationIds = participations.map(p => p.conversation_id);
    console.log("Conversation IDs to fetch:", conversationIds);

    // Get conversations without joining profiles directly
    const { data: conversations, error: conversationsError } = await supabase
      .from("conversations")
      .select(`
        id,
        created_at,
        is_pinned,
        is_archived,
        updated_at,
        latest_message:messages(
          content,
          created_at
        )
      `)
      .in("id", conversationIds)
      .order("updated_at", { ascending: false });

    if (conversationsError) {
      console.error("Error fetching conversations:", conversationsError);
      throw conversationsError;
    }

    console.log("Fetched conversations data:", conversations ? conversations.length : 0);

    // Map to track other participants by user ID to avoid duplicates
    const otherParticipantsMap = new Map();
    const result: Conversation[] = [];
    
    // First, collect all other participants for each conversation
    for (const convo of conversations || []) {
      // Get all participants for this conversation
      const { data: participants, error: participantsError } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", convo.id);
        
      if (participantsError) {
        console.error(`Error fetching participants for conversation ${convo.id}:`, participantsError);
        continue;
      }
      
      // Find the other participant (not the current user)
      const otherParticipantData = participants?.find(p => p.user_id !== userId);
      if (!otherParticipantData) {
        console.log(`No other participant found for conversation ${convo.id}`);
        continue;
      }
      
      const otherUserId = otherParticipantData.user_id;
      
      // If we already have a conversation with this user, check which one is more recent
      if (otherParticipantsMap.has(otherUserId)) {
        const existingConvo = otherParticipantsMap.get(otherUserId);
        // Keep the more recent conversation
        if (new Date(convo.updated_at) > new Date(existingConvo.updated_at)) {
          otherParticipantsMap.set(otherUserId, convo);
        }
      } else {
        // This is the first conversation we've found with this user
        otherParticipantsMap.set(otherUserId, convo);
      }
    }
    
    // Now process the unique conversations (one per other user)
    for (const [otherUserId, convo] of otherParticipantsMap.entries()) {
      // Get profile data for the other participant
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, age, country")
        .eq("id", otherUserId)
        .maybeSingle();
        
      if (profileError) {
        console.error(`Error fetching profile for user ${otherUserId}:`, profileError);
        continue;
      }
      
      // Extract latest message data
      let latestMessageContent = null;
      let latestMessageTime = null;
      
      if (Array.isArray(convo.latest_message) && convo.latest_message.length > 0) {
        const latestMsg = convo.latest_message[0];
        latestMessageContent = latestMsg?.content || null;
        latestMessageTime = latestMsg?.created_at || null;
      }
      
      // Create the conversation object with profile data
      result.push({
        id: convo.id,
        created_at: convo.created_at,
        updated_at: convo.updated_at,
        is_pinned: Boolean(convo.is_pinned),
        is_archived: Boolean(convo.is_archived),
        otherParticipant: profileData ? {
          id: profileData.id,
          name: profileData.name,
          avatar_url: profileData.avatar_url,
          age: profileData.age,
          country: profileData.country,
          is_online: false // Will be updated by online status hook
        } : null,
        isTemporary: false,
        latest_message: latestMessageContent,
        latest_message_time: latestMessageTime,
        other_participant_id: profileData?.id || null,
        other_participant_name: profileData?.name || null,
        other_participant_avatar: profileData?.avatar_url || null,
        other_participant_online: false
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    toast.error("Error loading conversations");
    return [];
  }
};
