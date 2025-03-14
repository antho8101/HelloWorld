
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createConversation = async (
  currentUserId: string,
  otherUserId: string
): Promise<string | null> => {
  try {
    console.log(`Creating conversation between users: ${currentUserId} and ${otherUserId}`);
    
    // Utiliser la fonction sécurisée pour créer ou récupérer une conversation
    const { data, error } = await supabase
      .rpc('create_conversation', { 
        p_other_user_id: otherUserId 
      });

    if (error) {
      console.error("Error creating conversation:", error);
      toast.error("Error creating conversation");
      return null;
    }

    // La fonction retourne directement l'ID de la conversation
    const conversationId = data;
    
    if (!conversationId) {
      console.error("No conversation ID was returned");
      toast.error("Error creating conversation - no ID returned");
      return null;
    }

    console.log("Conversation created or retrieved with ID:", conversationId);
    return conversationId;
    
  } catch (error) {
    console.error("Error in createConversation:", error);
    toast.error("Error creating the conversation");
    return null;
  }
};
