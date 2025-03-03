
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleMessageAction = async (
  currentUserId: string | null,
  profileId: string,
  onMessage: () => void
): Promise<boolean> => {
  if (!currentUserId || !profileId) {
    console.error('Missing user IDs:', { currentUserId, profileId });
    return false;
  }

  try {
    console.log('Starting message action between', currentUserId, 'and', profileId);

    // First check if a conversation already exists between these users
    const { data: existingConversations, error: checkError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (checkError) {
      console.error('Error checking existing conversations:', checkError);
      toast("Error checking existing conversations");
      return false;
    }

    if (existingConversations && existingConversations.length > 0) {
      // For each conversation that the current user is part of, check if the other user is also a participant
      const conversationIds = existingConversations.map(c => c.conversation_id);
      
      const { data: sharedConversations, error: sharedError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', profileId)
        .in('conversation_id', conversationIds);
      
      if (sharedError) {
        console.error('Error checking shared conversations:', sharedError);
        toast("Error checking shared conversations");
        return false;
      }
      
      if (sharedConversations && sharedConversations.length > 0) {
        // We found an existing conversation between these users
        console.log('Found existing conversation:', sharedConversations[0].conversation_id);
        onMessage(); // Call callback to indicate success
        return true;
      }
    }
    
    // No existing conversation, create a new one
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
    
    // 2. Add current user as participant
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
