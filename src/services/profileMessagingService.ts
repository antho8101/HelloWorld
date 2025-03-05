
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
    const { data: existingConversations, error: existingError } = await supabase
      .from("conversations")
      .select("id")
      .in("id", (
        // Sous-requête pour trouver les conversations où currentUserId participe
        supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", currentUserId)
      ))
      .in("id", (
        // Sous-requête pour trouver les conversations où profileId participe
        supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", profileId)
      ));

    if (existingError) {
      console.error('Error checking existing conversations:', existingError);
      // Continuons malgré l'erreur et essayons de créer une nouvelle conversation
    } else if (existingConversations && existingConversations.length > 0) {
      // Une conversation existe déjà entre ces utilisateurs
      console.log('Found existing conversation:', existingConversations[0].id);
      onMessage();
      return true;
    }

    // Pas de conversation existante, créons-en une nouvelle
    console.log('Creating a new conversation...');
    
    // Créer une nouvelle conversation
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
    
    // Ajouter les participants un par un avec gestion d'erreur robuste
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
        // Essayons quand même de continuer car l'utilisateur actuel est déjà ajouté
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
    
    // 1. Créer une nouvelle conversation
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
    
    // 2. Ajouter les participants séparément avec une meilleure gestion d'erreur
    try {
      // Ajouter l'utilisateur actuel
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
      
      // Ajouter l'autre utilisateur
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
