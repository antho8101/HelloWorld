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

    // Récupérer les conversations sans essayer de joindre les profiles directement
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

    // Maintenant, récupérons les participants séparément pour chaque conversation
    const result: Conversation[] = [];
    
    for (const convo of conversations || []) {
      // Obtenir tous les participants de cette conversation
      const { data: participants, error: participantsError } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", convo.id);
        
      if (participantsError) {
        console.error(`Error fetching participants for conversation ${convo.id}:`, participantsError);
        continue;
      }
      
      // Trouver l'autre participant (pas l'utilisateur actuel)
      const otherParticipantData = participants?.find(p => p.user_id !== userId);
      if (!otherParticipantData) {
        console.log(`No other participant found for conversation ${convo.id}`);
        continue;
      }
      
      // Récupérer les données du profil de l'autre participant
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, age, country")
        .eq("id", otherParticipantData.user_id)
        .maybeSingle();
        
      if (profileError) {
        console.error(`Error fetching profile for user ${otherParticipantData.user_id}:`, profileError);
        continue;
      }
      
      // Extraire les données du dernier message
      let latestMessageContent = null;
      let latestMessageTime = null;
      
      if (Array.isArray(convo.latest_message) && convo.latest_message.length > 0) {
        const latestMsg = convo.latest_message[0];
        latestMessageContent = latestMsg?.content || null;
        latestMessageTime = latestMsg?.created_at || null;
      }
      
      // Créer l'objet conversation avec les données du profil
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
          is_online: false // Sera mis à jour par le hook de statut en ligne
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

export const createConversation = async (
  currentUserId: string,
  otherUserId: string
): Promise<string | null> => {
  try {
    console.log(`Creating conversation between users: ${currentUserId} and ${otherUserId}`);
    
    // Create a new conversation first
    const { data: newConversation, error: conversationError } = await supabase
      .from("conversations")
      .insert([{}])
      .select()
      .single();

    if (conversationError) {
      console.error("Error creating conversation:", conversationError);
      toast.error("Error creating conversation");
      return null;
    }

    if (!newConversation) {
      console.error("No conversation was created (empty response)");
      toast.error("Error creating conversation - no data returned");
      return null;
    }

    console.log("Created new conversation with ID:", newConversation.id);

    // Add participants one by one for better error handling
    const { error: currentUserError } = await supabase
      .from("conversation_participants")
      .insert({ 
        conversation_id: newConversation.id, 
        user_id: currentUserId 
      });

    if (currentUserError) {
      console.error("Error adding current user as participant:", currentUserError);
      toast.error("Error adding you to the conversation");
      return null;
    }

    console.log(`Added current user ${currentUserId} as participant`);

    const { error: otherUserError } = await supabase
      .from("conversation_participants")
      .insert({ 
        conversation_id: newConversation.id, 
        user_id: otherUserId 
      });

    if (otherUserError) {
      console.error("Error adding other user as participant:", otherUserError);
      toast.error("Error adding other user to the conversation");
      return null;
    }

    console.log(`Added other user ${otherUserId} as participant`);
    console.log("Conversation creation completed successfully");
    
    return newConversation.id;
  } catch (error) {
    console.error("Error in createConversation:", error);
    toast.error("Error creating the conversation");
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
