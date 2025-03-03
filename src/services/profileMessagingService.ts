
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

    // Create new conversation directly without checking for existing ones
    // This approach avoids the RLS recursion issue
    const newConversationId = await createNewConversation(currentUserId, profileId);
    
    if (newConversationId) {
      console.log('Created new conversation:', newConversationId);
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
