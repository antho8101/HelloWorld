
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleMessageAction = async (
  currentUserId: string | null,
  profileId: string,
  onMessage: () => void
): Promise<boolean> => {
  if (!currentUserId || !profileId) return false;

  try {
    // Instead of checking all participations at once, let's use a more direct approach
    // to avoid the infinite recursion issue
    const newConversationId = await createNewConversation(currentUserId, profileId);
    
    if (newConversationId) {
      onMessage(); // Call callback to indicate success
      return true;
    }
    
    return false;
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
    
    // 2. Add each participant separately to avoid any potential RLS recursion issues
    // First, add current user as participant
    const { error: currentUserError } = await supabase
      .from('conversation_participants')
      .insert([{ 
        conversation_id: newConversation.id, 
        user_id: currentUserId 
      }]);
    
    if (currentUserError) {
      console.error('Error adding current user as participant:', currentUserError);
      toast("Error adding you to the conversation");
      return null;
    }
    
    console.log('Added current user to conversation');
    
    // 3. Add other user as participant
    const { error: otherUserError } = await supabase
      .from('conversation_participants')
      .insert([{ 
        conversation_id: newConversation.id, 
        user_id: profileId 
      }]);
    
    if (otherUserError) {
      console.error('Error adding other user as participant:', otherUserError);
      toast("Error adding the other person to the conversation");
      return null;
    }
    
    console.log('Added other user to conversation. Conversation setup complete!');
    
    return newConversation.id;
  } catch (error) {
    console.error('Error creating new conversation:', error);
    toast("Error creating the conversation. Please try again later.");
    return null;
  }
};
