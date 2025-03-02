
import { supabase } from "@/integrations/supabase/client";
import type { Conversation } from "@/types/messages";

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const { data: participations, error: participationsError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);

    if (participationsError) throw participationsError;

    if (!participations || participations.length === 0) {
      return [];
    }

    const conversationIds = participations.map(p => p.conversation_id);

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
        ),
        participants:conversation_participants(
          user_id,
          user:profiles(
            id,
            name,
            avatar_url,
            last_seen
          )
        )
      `)
      .in("id", conversationIds)
      .order("updated_at", { ascending: false });

    if (conversationsError) throw conversationsError;

    return (conversations || []).map(convo => {
      // Initialize with default values
      let otherParticipant = null;
      let otherParticipantId = null;
      let otherParticipantName = null;
      let otherParticipantAvatar = null;
      let latestMessageContent = null;
      let latestMessageTime = null;

      // Process participants safely
      if (Array.isArray(convo.participants)) {
        // Find other participant (not current user)
        const participant = convo.participants.find(p => p.user_id !== userId);
        
        if (participant) {
          // Ensure user object exists
          const userData = participant.user;
          
          // Only proceed if userData is a valid object
          if (userData && typeof userData === 'object') {
            // Safe property access with in operator
            if ('id' in userData) otherParticipantId = userData.id;
            if ('name' in userData) otherParticipantName = userData.name;
            if ('avatar_url' in userData) otherParticipantAvatar = userData.avatar_url;
            
            // Create participant object only if we have an ID
            if (otherParticipantId) {
              otherParticipant = { 
                id: otherParticipantId, 
                name: otherParticipantName, 
                avatar_url: otherParticipantAvatar 
              };
            }
          }
        }
      }

      // Process latest message safely
      if (Array.isArray(convo.latest_message) && convo.latest_message.length > 0) {
        const latestMsg = convo.latest_message[0];
        if (latestMsg && typeof latestMsg === 'object') {
          if ('content' in latestMsg) latestMessageContent = latestMsg.content;
          if ('created_at' in latestMsg) latestMessageTime = latestMsg.created_at;
        }
      }

      // Return a properly typed Conversation object
      return {
        id: convo.id,
        created_at: convo.created_at,
        updated_at: convo.updated_at,
        is_pinned: Boolean(convo.is_pinned),
        is_archived: Boolean(convo.is_archived),
        otherParticipant,
        isTemporary: false,
        latest_message: latestMessageContent,
        latest_message_time: latestMessageTime,
        other_participant_id: otherParticipantId,
        other_participant_name: otherParticipantName,
        other_participant_avatar: otherParticipantAvatar,
        other_participant_online: false // Will be updated by the online status hook
      };
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export const createConversation = async (
  currentUserId: string,
  otherUserId: string
): Promise<string | null> => {
  try {
    // Create a new conversation
    const { data: newConversation, error: conversationError } = await supabase
      .from("conversations")
      .insert([{ is_pinned: false, is_archived: false }])
      .select()
      .single();

    if (conversationError) throw conversationError;

    // Add both users as participants
    const { error: participantsError } = await supabase
      .from("conversation_participants")
      .insert([
        { conversation_id: newConversation.id, user_id: currentUserId },
        { conversation_id: newConversation.id, user_id: otherUserId },
      ]);

    if (participantsError) throw participantsError;

    return newConversation.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
};

export const updateConversationTimestamp = async (conversationId: string): Promise<void> => {
  try {
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  } catch (error) {
    console.error("Error updating conversation timestamp:", error);
  }
};
