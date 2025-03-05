
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

    let existingConversationId = null;

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
        // Don't fail here, just log the error and continue
        console.log('Continuing with conversation creation despite error');
      } else if (sharedConversations && sharedConversations.length > 0) {
        // If shared conversation exists, use that
        console.log('Found existing conversation:', sharedConversations[0].conversation_id);
        existingConversationId = sharedConversations[0].conversation_id;
        onMessage();
        return true;
      }
    }
    
    if (!existingConversationId) {
      console.log('No existing conversation found, creating new one');
      
      // Create new conversation if none exists
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
      
      // Add both participants one by one to avoid potential errors
      const participantsPromises = [
        supabase.from('conversation_participants').insert({ 
          conversation_id: newConversation[0].id, 
          user_id: currentUserId 
        }),
        supabase.from('conversation_participants').insert({ 
          conversation_id: newConversation[0].id, 
          user_id: profileId 
        })
      ];
      
      try {
        const results = await Promise.all(participantsPromises);
        const errors = results.filter(r => r.error).map(r => r.error);
        
        if (errors.length > 0) {
          console.error('Error adding some participants:', errors);
          toast("Warning: Not all participants may have been added");
          // Continue anyway as we might have partial success
        }
        
        console.log('Added participants to conversation. Conversation setup complete!');
        onMessage();
        return true;
      } catch (participantsError) {
        console.error('Error in adding participants:', participantsError);
        toast("Error adding conversation participants");
        return false;
      }
    }
    
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
      .select();
    
    if (conversationError) {
      console.error('Error creating conversation:', conversationError);
      toast("Error creating new conversation");
      return null;
    }

    if (!newConversation || newConversation.length === 0) {
      console.error('No conversation was created');
      toast("Error creating new conversation - no data returned");
      return null;
    }
    
    console.log('Created conversation with ID:', newConversation[0].id);
    
    // 2. Add participants separately to avoid potential RLS issues
    const participantsPromises = [
      supabase.from('conversation_participants').insert({ 
        conversation_id: newConversation[0].id, 
        user_id: currentUserId 
      }),
      supabase.from('conversation_participants').insert({ 
        conversation_id: newConversation[0].id, 
        user_id: profileId 
      })
    ];
    
    try {
      const results = await Promise.all(participantsPromises);
      const errors = results.filter(r => r.error).map(r => r.error);
      
      if (errors.length > 0) {
        console.error('Error adding some participants:', errors);
        // Continue anyway, we might have partial success
      }
      
      console.log('Added all participants to conversation. Conversation setup complete!');
      return newConversation[0].id;
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
