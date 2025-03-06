
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createConversation = async (
  currentUserId: string,
  otherUserId: string
): Promise<string | null> => {
  try {
    console.log(`Creating conversation between users: ${currentUserId} and ${otherUserId}`);
    
    // Create a new conversation first
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
