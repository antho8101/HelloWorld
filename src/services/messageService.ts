
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
    
    // Utilisons directement une requête SQL au lieu de la fonction RPC problématique
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        sender_id,
        is_read,
        profiles:sender_id (name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error('[messageService] Error fetching messages:', messagesError);
      console.error('[messageService] Error details:', messagesError.message, messagesError.details);
      throw messagesError;
    }
    
    if (!messagesData || messagesData.length === 0) {
      console.log('[messageService] No messages found for this conversation');
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
      sender_name: msg.profiles?.name || null,
      sender_avatar: msg.profiles?.avatar_url || null
    }));
    
    // Marquer les messages non-lus comme lus
    const unreadMessages = messagesData
      .filter(msg => msg.sender_id !== currentUserId && !msg.is_read)
      .map(msg => msg.id);
      
    if (unreadMessages.length > 0) {
      console.log(`[messageService] Marking ${unreadMessages.length} messages as read`);
      await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadMessages);
    }
    
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
    
    // Insérer directement le message au lieu d'utiliser la fonction RPC
    const { data: insertedMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: messageData.conversation_id,
        content: messageData.content,
        sender_id: messageData.sender_id
      })
      .select('id, content, created_at, sender_id')
      .single();

    // Gestion explicite des erreurs avec plus de détails
    if (messageError) {
      console.error('[messageService] Error sending message:', messageError);
      console.error('[messageService] Error details:', messageError.message, messageError.details);
      throw new Error(`Could not send message: ${messageError.message}`);
    }

    // Vérification et log du résultat
    if (!insertedMessage) {
      console.error('[messageService] No data returned from message insertion');
      throw new Error('Could not send message: No data returned');
    }

    console.log('[messageService] Message sent successfully, data returned:', insertedMessage);
    
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
      id: insertedMessage.id,
      content: insertedMessage.content,
      created_at: insertedMessage.created_at,
      sender_id: insertedMessage.sender_id,
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
