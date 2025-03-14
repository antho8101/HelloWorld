
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Message } from "@/types/messages";
import { updateConversationTimestamp } from "@/services/conversation";

interface MessagePayload {
  content: string;
  conversation_id: string;
  sender_id: string;
}

export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  if (!conversationId) {
    console.error('fetchMessages called with empty conversationId');
    return [];
  }
  
  try {
    console.log(`[messageService] Fetching messages for conversation: ${conversationId}`);
    
    // First verify we have a logged-in user
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error('[messageService] No authenticated session found', sessionError);
      return [];
    }
    
    const currentUserId = sessionData.session.user.id;
    console.log('[messageService] Current user ID:', currentUserId);

    // Use the get_conversation_messages function with more detailed error handling
    const { data: messagesData, error: messagesError } = await supabase
      .rpc('get_conversation_messages', { p_conversation_id: conversationId });
    
    if (messagesError) {
      console.error('[messageService] Error fetching messages:', messagesError);
      console.error('[messageService] Error details:', messagesError.message, messagesError.details);
      throw messagesError;
    }
    
    if (!messagesData) {
      console.log('[messageService] No messages data returned from query');
      return [];
    }
    
    console.log(`[messageService] Retrieved ${messagesData.length} messages from database`);
    if (messagesData.length > 0) {
      console.log('[messageService] First message sample:', messagesData[0]);
    }
    
    // Format messages for the application
    const formattedMessages: Message[] = messagesData.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      created_at: msg.created_at,
      sender_id: msg.sender_id,
      sender_name: msg.sender_name || null,
      sender_avatar: msg.sender_avatar || null
    }));
    
    console.log('[messageService] Final formatted messages count:', formattedMessages.length);
    return formattedMessages;
  } catch (error) {
    console.error("[messageService] Error in fetchMessages service:", error);
    throw error;
  }
};

export const sendMessage = async (
  messageData: MessagePayload
): Promise<Message | null> => {
  try {
    console.log('[messageService] Sending message to conversation:', messageData.conversation_id);
    console.log('[messageService] Message content:', messageData.content);
    
    if (!messageData.content || !messageData.conversation_id) {
      console.error('[messageService] Invalid message data:', messageData);
      throw new Error('Invalid message data');
    }
    
    // Appel de la fonction RPC avec les bons paramètres et logging amélioré
    const { data, error: messageError } = await supabase
      .rpc('send_message', {
        p_content: messageData.content,
        p_conversation_id: messageData.conversation_id
      });

    // Gestion explicite des erreurs avec plus de détails
    if (messageError) {
      console.error('[messageService] Error sending message:', messageError);
      console.error('[messageService] Error details:', messageError.message, messageError.details, messageError.hint);
      throw new Error(`Could not send message: ${messageError.message}`);
    }

    // Vérification et log du résultat
    if (!data || data.length === 0) {
      console.error('[messageService] No data returned from message insertion');
      throw new Error('Could not send message: No data returned');
    }

    console.log('[messageService] Message sent successfully, data returned:', data);

    // Extraire le message de la réponse
    const newMessage = data[0];
    
    // Mettre à jour le timestamp de la conversation
    await updateConversationTimestamp(messageData.conversation_id);

    // Récupérer les informations du profil pour le message
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", messageData.sender_id)
      .maybeSingle();
      
    if (profileError) {
      console.warn('[messageService] Error fetching profile for message:', profileError);
    }

    // Créer l'objet de message complet pour l'UI
    const completeMessage: Message = {
      id: newMessage.id,
      content: newMessage.content,
      created_at: newMessage.created_at,
      sender_id: newMessage.sender_id,
      sender_name: profileData?.name || null,
      sender_avatar: profileData?.avatar_url || null
    };
    
    console.log('[messageService] Returning complete message:', completeMessage);
    return completeMessage;
  } catch (error) {
    console.error("[messageService] Error sending message:", error);
    throw error;
  }
};
