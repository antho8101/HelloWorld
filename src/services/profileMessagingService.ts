
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

    // Approche simplifiée pour vérifier les conversations existantes
    const { data: participations, error: participationsError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", currentUserId);

    if (participationsError) {
      console.error('Error fetching user participations:', participationsError);
      // Continue despite error and try to create a new conversation
    }

    // Get conversation IDs where the current user participates
    const conversationIds = participations?.map(p => p.conversation_id) || [];
    
    if (conversationIds.length > 0) {
      // Find if the other user is in any of those conversations
      const { data: existingConversations, error: existingError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", profileId)
        .in("conversation_id", conversationIds);

      if (existingError) {
        console.error('Error checking existing conversations:', existingError);
        // Continue despite error and try to create a new conversation
      } else if (existingConversations && existingConversations.length > 0) {
        // A conversation exists already between these users
        console.log('Found existing conversation:', existingConversations[0].conversation_id);
        onMessage();
        return true;
      }
    }

    // No existing conversation found, create a new one
    console.log('Creating a new conversation...');
    
    // Create a new conversation
    const { data: newConversation, error: conversationError } = await supabase
      .from('conversations')
      .insert([{ is_pinned: false, is_archived: false }])
      .select();
    
    if (conversationError) {
      console.error('Error creating conversation:', conversationError);
      toast("Error creating new conversation");
      return false;
    }

    if (!newConversation || newConversation.length === 0) {
      console.error('No conversation was created');
      toast("Error creating new conversation - no data returned");
      return false;
    }
    
    console.log('Created conversation with ID:', newConversation[0].id);
    
    // Add the participants one by one with robust error handling
    try {
      const currentUserResult = await supabase
        .from('conversation_participants')
        .insert({ 
          conversation_id: newConversation[0].id, 
          user_id: currentUserId 
        });
      
      if (currentUserResult.error) {
        console.error('Error adding current user to conversation:', currentUserResult.error);
        toast("Error adding you to the conversation");
        return false;
      }
      
      const otherUserResult = await supabase
        .from('conversation_participants')
        .insert({ 
          conversation_id: newConversation[0].id, 
          user_id: profileId 
        });
      
      if (otherUserResult.error) {
        console.error('Error adding other user to conversation:', otherUserResult.error);
        toast("Error adding other user to the conversation");
        // Try to continue anyway since current user is already added
      }
      
      console.log('Participants added successfully. Conversation setup complete!');
      onMessage();
      return true;
    } catch (participantsError) {
      console.error('Error in adding participants:', participantsError);
      toast("Error adding conversation participants");
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
    console.log('Creating new conversation between', currentUserId, 'and', profileId);
    
    // 1. Create a new conversation
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

    if (!newConversation) {
      console.error('No conversation was created');
      toast("Error creating new conversation - no data returned");
      return null;
    }
    
    console.log('Created conversation with ID:', newConversation.id);
    
    // 2. Add the participants separately with better error handling
    try {
      // Add the current user
      const currentUserResult = await supabase
        .from('conversation_participants')
        .insert({ 
          conversation_id: newConversation.id, 
          user_id: currentUserId 
        });
      
      if (currentUserResult.error) {
        console.error('Error adding current user to conversation:', currentUserResult.error);
        toast("Error adding you to the conversation");
        return null;
      }
      
      // Add the other user
      const otherUserResult = await supabase
        .from('conversation_participants')
        .insert({ 
          conversation_id: newConversation.id, 
          user_id: profileId 
        });
      
      if (otherUserResult.error) {
        console.error('Error adding other user to conversation:', otherUserResult.error);
        toast("Error adding other user to the conversation");
        return null;
      }
      
      console.log('Added all participants to conversation. Conversation setup complete!');
      return newConversation.id;
    } catch (participantsError) {
      console.error('Error in participant creation:', participantsError);
      toast("Error adding conversation participants");
      return null;
    }
  } catch (error) {
    console.error('Error creating new conversation:', error);
    toast("Error creating the conversation. Please try again later.");
    return null;
  }
};
