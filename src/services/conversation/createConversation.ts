
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createConversation = async (
  currentUserId: string,
  otherUserId: string
): Promise<string | null> => {
  try {
    console.log(`Creating conversation between users: ${currentUserId} and ${otherUserId}`);
    
    // First, check if there's already a conversation between these users
    const { data: existingParticipations, error: existingError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", currentUserId);
      
    if (!existingError && existingParticipations && existingParticipations.length > 0) {
      // Get conversation IDs where current user is a participant
      const conversationIds = existingParticipations.map(p => p.conversation_id);
      
      // Find conversations where the other user is also a participant
      const { data: sharedConversations, error: sharedError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .in("conversation_id", conversationIds)
        .eq("user_id", otherUserId);
        
      if (!sharedError && sharedConversations && sharedConversations.length > 0) {
        // We found an existing conversation between these users
        console.log("Found existing conversation:", sharedConversations[0].conversation_id);
        return sharedConversations[0].conversation_id;
      }
    }
    
    // No existing conversation found, create a new one
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
