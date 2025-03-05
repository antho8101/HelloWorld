
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleMessageAction = async (
  currentUserId: string | null,
  profileId: string,
  onMessage: () => void
): Promise<boolean> => {
  if (!currentUserId || !profileId) {
    console.error('Missing user IDs:', { currentUserId, profileId });
    toast("Missing user information. Please make sure you're logged in.");
    return false;
  }

  try {
    console.log('Starting message action between', currentUserId, 'and', profileId);

    // First check if a conversation already exists between these users
    const { data: existingParticipations, error: participationsError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", currentUserId);

    if (participationsError) {
      console.error('Error fetching participations:', participationsError);
      toast("Error checking existing conversations");
      return false;
    }

    if (existingParticipations && existingParticipations.length > 0) {
      // Get conversation IDs where current user is a participant
      const conversationIds = existingParticipations.map(p => p.conversation_id);

      // Check if the other user is in any of these conversations
      const { data: sharedConversations, error: sharedError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", profileId)
        .in("conversation_id", conversationIds);

      if (sharedError) {
        console.error('Error checking shared conversations:', sharedError);
        toast("Error checking shared conversations");
        return false;
      }

      // If shared conversation exists, use that
      if (sharedConversations && sharedConversations.length > 0) {
        console.log('Found existing conversation:', sharedConversations[0].conversation_id);
        onMessage();
        return true;
      }
    }
    
    console.log('No existing conversation found, creating new one');
    
    // Create new conversation if none exists
    const { data: newConversation, error: conversationError } = await supabase
      .from('conversations')
      .insert([{ is_pinned: false, is_archived: false }])
      .select()
      .single();
    
    if (conversationError) {
      console.error('Error creating conversation:', conversationError);
      toast("Error creating new conversation");
      return false;
    }
    
    console.log('Created conversation with ID:', newConversation.id);
    
    // Add both participants at once
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: newConversation.id, user_id: currentUserId },
        { conversation_id: newConversation.id, user_id: profileId }
      ]);
    
    if (participantsError) {
      console.error('Error adding participants:', participantsError);
      toast("Error adding conversation participants");
      return false;
    }
    
    console.log('Added participants to conversation. Conversation setup complete!');
    onMessage();
    return true;
  } catch (error) {
    console.error('Error handling message action:', error);
    toast("Error processing the message action. Please try again later.");
    return false;
  }
};

export const createNewConversation = async (
  currentUserId: string,
  profileId: string
): Promise<string | null> => {
  try {
    console.log('Creating new conversation between', currentUserId, 'and', profileId);
    
    // 1. Create new conversation
    const { data: newConversation, error: conversationError } = await supabase
      .from('conversations')
      .insert([{ is_pinned: false, is_archived: false }])
      .select()
      .single();
    
    if (conversationError) {
      console.error('Error creating conversation:', conversationError);
      toast("Error creating new conversation");
      return null;
    }
    
    console.log('Created conversation with ID:', newConversation.id);
    
    // 2. Add participants in a different way to avoid RLS issues
    const participantsData = [
      { conversation_id: newConversation.id, user_id: currentUserId },
      { conversation_id: newConversation.id, user_id: profileId }
    ];
    
    // Insert all participants at once instead of separate queries
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participantsData);
    
    if (participantsError) {
      console.error('Error adding participants:', participantsError);
      toast("Error adding conversation participants");
      return null;
    }
    
    console.log('Added all participants to conversation. Conversation setup complete!');
    
    return newConversation.id;
  } catch (error) {
    console.error('Error creating new conversation:', error);
    toast("Error creating the conversation. Please try again later.");
    return null;
  }
};
