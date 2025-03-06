
import { supabase } from "@/integrations/supabase/client";
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
            age,
            country,
            last_seen
          )
        )
      `)
      .in("id", conversationIds)
      .order("updated_at", { ascending: false });

    if (conversationsError) {
      console.error("Error fetching conversations:", conversationsError);
      throw conversationsError;
    }

    console.log("Fetched conversations data:", conversations ? conversations.length : 0);

    return (conversations || []).map(convo => {
      // Initialize with default values
      let otherParticipant = null;
      let otherParticipantId = null;
      let otherParticipantName = null;
      let otherParticipantAvatar = null;
      let otherParticipantAge = null;
      let otherParticipantCountry = null;
      let latestMessageContent = null;
      let latestMessageTime = null;

      // Process participants safely
      if (Array.isArray(convo.participants)) {
        // Find other participant (not current user)
        const participant = convo.participants.find(p => p.user_id !== userId);
        
        if (participant && participant.user) {
          // If participant.user is an array (which can happen with Supabase joins), take the first item
          const userData = Array.isArray(participant.user) 
            ? participant.user[0] 
            : participant.user;
          
          // Now safely extract properties from userData
          if (userData && typeof userData === 'object') {
            otherParticipantId = 'id' in userData ? userData.id : null;
            otherParticipantName = 'name' in userData ? userData.name : null;
            otherParticipantAvatar = 'avatar_url' in userData ? userData.avatar_url : null;
            otherParticipantAge = 'age' in userData ? userData.age : null;
            otherParticipantCountry = 'country' in userData ? userData.country : null;
            
            // Create participant object only if we have an ID
            if (otherParticipantId) {
              otherParticipant = { 
                id: otherParticipantId, 
                name: otherParticipantName, 
                avatar_url: otherParticipantAvatar,
                age: otherParticipantAge,
                country: otherParticipantCountry,
                is_online: false // Will be updated by the online status hook
              };
            }
          }
        }
      }

      // Process latest message safely
      if (Array.isArray(convo.latest_message) && convo.latest_message.length > 0) {
        const latestMsg = convo.latest_message[0];
        if (latestMsg && typeof latestMsg === 'object') {
          latestMessageContent = 'content' in latestMsg ? latestMsg.content : null;
          latestMessageTime = 'created_at' in latestMsg ? latestMsg.created_at : null;
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
    console.log(`Creating conversation between users: ${currentUserId} and ${otherUserId}`);
    
    // Create a new conversation
    const { data: newConversation, error: conversationError } = await supabase
      .from("conversations")
      .insert([{ is_pinned: false, is_archived: false }])
      .select();

    if (conversationError) {
      console.error("Error creating conversation:", conversationError);
      throw conversationError;
    }

    if (!newConversation || newConversation.length === 0) {
      console.error("No conversation was created (empty response)");
      return null;
    }

    console.log("Created new conversation with ID:", newConversation[0].id);

    // Add participants one by one for better error handling
    try {
      // Add current user as participant
      const { error: currentUserError } = await supabase
        .from("conversation_participants")
        .insert([{ 
          conversation_id: newConversation[0].id, 
          user_id: currentUserId 
        }]);

      if (currentUserError) {
        console.error("Error adding current user as participant:", currentUserError);
        throw currentUserError;
      }

      console.log(`Added current user ${currentUserId} as participant`);

      // Add other user as participant
      const { error: otherUserError } = await supabase
        .from("conversation_participants")
        .insert([{ 
          conversation_id: newConversation[0].id, 
          user_id: otherUserId 
        }]);

      if (otherUserError) {
        console.error("Error adding other user as participant:", otherUserError);
        throw otherUserError;
      }

      console.log(`Added other user ${otherUserId} as participant`);

      return newConversation[0].id;
    } catch (participantError) {
      console.error("Error adding participants:", participantError);
      return null;
    }
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
