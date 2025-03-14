
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
      console.log("Missing user ID or empty message");
      return false;
    }

    try {
      setSending(true);
      console.log("Sending message to receiver:", receiverId);
      let conversationId = activeConversation?.id;

      // If the conversation is temporary or doesn't have an ID, create a new one
      if (!conversationId || activeConversation?.isTemporary) {
        console.log("Creating new conversation for message");
        // Create a new conversation
        const newConversationId = await createConversation(currentUserId, receiverId);
        
        if (!newConversationId) {
          console.error("Failed to create conversation - received null ID");
          toast.error("Failed to create conversation");
          throw new Error("Failed to create conversation");
        }
        
        conversationId = newConversationId;
        console.log("New conversation created with ID:", conversationId);
      }

      // Send the message
      const messageData = {
        content,
        conversation_id: conversationId,
        sender_id: currentUserId
      };

      console.log("Sending message with data:", messageData);
      
      try {
        const sentMessage = await sendMessageService(messageData);
        
        if (!sentMessage) {
          console.error("Failed to send message - API returned failure");
          throw new Error("Failed to send message");
        }
  
        console.log("Message sent successfully");
        
        // Add the new message directly
        addMessage(sentMessage);
        
        // Reset the message input
        setNewMessage("");
        return true;
      } catch (error) {
        console.error("Error in message sending:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message. Please try again.");
      return false;
    } finally {
      setSending(false);
    }
  }, [currentUserId, activeConversation, addMessage, setSending, setNewMessage]);

  return { sendMessage };
};
