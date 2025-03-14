
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

    // No existing conversation found, create a new one using the RPC function
    console.log('Creating a new conversation via RPC...');
    const { data: conversationId, error: createError } = await supabase
      .rpc('create_conversation', { 
        p_other_user_id: profileId 
      });
    
    if (createError) {
      console.error('Error creating conversation:', createError);
      toast("Error creating new conversation");
      return false;
    }

    if (!conversationId) {
      console.error('No conversation ID was returned');
      toast("Error creating new conversation - no ID returned");
      return false;
    }
    
    console.log('Created or retrieved conversation with ID:', conversationId);
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
    
    // Use the RPC function to create or retrieve a conversation
    const { data: conversationId, error } = await supabase
      .rpc('create_conversation', { 
        p_other_user_id: profileId 
      });
    
    if (error) {
      console.error('Error creating conversation:', error);
      toast("Error creating new conversation");
      return null;
    }
    
    if (!conversationId) {
      console.error('No conversation ID was returned');
      toast("Error creating new conversation - no ID returned");
      return null;
    }
    
    console.log('Created or retrieved conversation with ID:', conversationId);
    return conversationId;
  } catch (error) {
    console.error('Error creating new conversation:', error);
    toast("Error creating the conversation. Please try again later.");
    return null;
  }
};
