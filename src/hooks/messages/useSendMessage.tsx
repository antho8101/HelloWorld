
import { useCallback } from "react";
import { toast } from "sonner";
import { sendMessage as sendMessageService } from "@/services/messageService";
import { createConversation } from "@/services/conversation";
import type { Message, Conversation } from "@/types/messages";

export const useSendMessage = (
  currentUserId: string | null,
  activeConversation: Conversation | null,
  addMessage: (message: Message) => void,
  setSending: (sending: boolean) => void,
  setNewMessage: (message: string) => void
) => {
  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!currentUserId || !content.trim()) {
      console.log("[useSendMessage] Missing user ID or empty message");
      return false;
    }

    try {
      setSending(true);
      console.log("[useSendMessage] Preparing to send message to receiver:", receiverId);
      console.log("[useSendMessage] Message content:", content);
      
      let conversationId = activeConversation?.id;

      // Si la conversation est temporaire ou n'a pas d'ID, en créer une nouvelle
      if (!conversationId || activeConversation?.isTemporary) {
        console.log("[useSendMessage] Creating new conversation for message");
        // Créer une nouvelle conversation
        const newConversationId = await createConversation(currentUserId, receiverId);
        
        if (!newConversationId) {
          console.error("[useSendMessage] Failed to create conversation - received null ID");
          toast.error("Failed to create conversation");
          throw new Error("Failed to create conversation");
        }
        
        conversationId = newConversationId;
        console.log("[useSendMessage] New conversation created with ID:", conversationId);
      }

      // Préparer les données du message
      const messageData = {
        content,
        conversation_id: conversationId,
        sender_id: currentUserId
      };

      console.log("[useSendMessage] Sending message with data:", messageData);
      
      try {
        // Envoi du message avec le service
        const sentMessage = await sendMessageService(messageData);
        
        if (!sentMessage) {
          console.error("[useSendMessage] Failed to send message - API returned no message");
          throw new Error("Failed to send message");
        }
  
        console.log("[useSendMessage] Message sent successfully, received:", sentMessage);
        
        // Ajouter le nouveau message directement à l'état
        addMessage(sentMessage);
        
        // Réinitialiser le champ de saisie
        setNewMessage("");
        return true;
      } catch (error) {
        console.error("[useSendMessage] Error in message sending service:", error);
        toast.error(`Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }
    } catch (error) {
      console.error("[useSendMessage] Error in overall sending process:", error);
      toast.error("Error sending message. Please try again.");
      return false;
    } finally {
      setSending(false);
    }
  }, [currentUserId, activeConversation, addMessage, setSending, setNewMessage]);

  return { sendMessage };
};
