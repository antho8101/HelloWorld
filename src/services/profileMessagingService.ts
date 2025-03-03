
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleMessageAction = async (
  currentUserId: string | null,
  profileId: string,
  onMessage: () => void
): Promise<boolean> => {
  if (!currentUserId || !profileId) return false;

  try {
    // Check if a conversation already exists between these two users
    const { data: existingParticipations, error: participationsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);
    
    if (participationsError) {
      console.error('Error fetching participations:', participationsError);
      toast("Error checking existing conversations");
      return false;
    }
    
    // Get all conversation IDs where the current user is a participant
    const conversationIds = existingParticipations?.map(p => p.conversation_id) || [];
    
    // If there are no conversations, create a new one
    if (conversationIds.length === 0) {
      const newConversationId = await createNewConversation(currentUserId, profileId);
      if (newConversationId) {
        onMessage(); // Call callback to indicate success
        return true;
      }
      return false;
    }
    
    // Find conversations where the other user is also a participant
    const { data: otherUserParticipations, error: otherUserError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .in('conversation_id', conversationIds)
      .eq('user_id', profileId);
    
    if (otherUserError) {
      console.error('Error checking other user participations:', otherUserError);
      toast("Error checking shared conversations");
      return false;
    }
    
    // If there's a common conversation, use that
    if (otherUserParticipations && otherUserParticipations.length > 0) {
      // Use the first existing conversation
      onMessage();
      return true;
    } else {
      // Create a new conversation if none exists
      const newConversationId = await createNewConversation(currentUserId, profileId);
      if (newConversationId) {
        onMessage();
        return true;
      }
      return false;
    }
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
    
    // 2. Add current user as participant first
    const { error: currentUserError } = await supabase
      .from('conversation_participants')
      .insert([{ conversation_id: newConversation.id, user_id: currentUserId }]);
    
    if (currentUserError) {
      console.error('Error adding current user as participant:', currentUserError);
      toast("Error adding you to the conversation");
      return null;
    }
    
    // 3. Add other user as participant
    const { error: otherUserError } = await supabase
      .from('conversation_participants')
      .insert([{ conversation_id: newConversation.id, user_id: profileId }]);
    
    if (otherUserError) {
      console.error('Error adding other user as participant:', otherUserError);
      toast("Error adding the other person to the conversation");
      return null;
    }
    
    return newConversation.id;
  } catch (error) {
    console.error('Error creating new conversation:', error);
    toast("Error creating the conversation. Please try again later.");
    return null;
  }
};
