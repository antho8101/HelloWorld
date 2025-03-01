
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
    
    if (participationsError) throw participationsError;
    
    // Get all conversation IDs where the current user is a participant
    const conversationIds = existingParticipations?.map(p => p.conversation_id) || [];
    
    // If there are no conversations, create a new one
    if (conversationIds.length === 0) {
      const newConversationId = await createNewConversation(currentUserId, profileId);
      if (newConversationId) {
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
    
    if (otherUserError) throw otherUserError;
    
    // If there's a common conversation, use that
    if (otherUserParticipations && otherUserParticipations.length > 0) {
      // Use the first existing conversation
      onMessage();
      return true;
    } else {
      // Create a new conversation if none exists
      const newConversationId = await createNewConversation(currentUserId, profileId);
      if (newConversationId) {
        return true;
      }
      return false;
    }
  } catch (error) {
    console.error('Error handling message action:', error);
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
    
    if (conversationError) throw conversationError;
    
    // 2. Add both users as participants
    const participantsToInsert = [
      { conversation_id: newConversation.id, user_id: currentUserId },
      { conversation_id: newConversation.id, user_id: profileId }
    ];
    
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participantsToInsert);
    
    if (participantsError) throw participantsError;
    
    return newConversation.id;
  } catch (error) {
    console.error('Error creating new conversation:', error);
    return null;
  }
};
