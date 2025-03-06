
import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";
import type { Conversation, Message } from "@/types/messages";
import { 
  fetchConversations as fetchConversationsService,
  createConversation
} from "@/services/conversationService";
import {
  fetchMessages as fetchMessagesService,
  sendMessage as sendMessageService
} from "@/services/messageService";

export const useMessages = () => {
  const { currentUserId } = useSession();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId]);

  const fetchConversations = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const conversationsData = await fetchConversationsService(currentUserId);
      setConversations(conversationsData);
    } catch (error) {
      console.error("Error in useMessages.fetchConversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!conversationId) return;
    
    try {
      setLoadingMessages(true);
      const messagesData = await fetchMessagesService(conversationId);
      setMessages(messagesData);
    } catch (error) {
      console.error("Error in useMessages.fetchMessages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    if (!currentUserId || !content.trim()) {
      console.log("Missing user ID or empty message");
      return;
    }

    try {
      console.log("Sending message to receiver:", receiverId);
      let conversationId = activeConversation?.id;

      // Si la conversation est temporaire ou n'a pas d'ID, on doit en créer une nouvelle
      if (!conversationId || activeConversation?.isTemporary) {
        console.log("Creating new conversation for message");
        // Create a new conversation
        const newConversationId = await createConversation(currentUserId, receiverId);
        
        if (!newConversationId) {
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
      const success = await sendMessageService(messageData);

      if (!success) {
        throw new Error("Failed to send message");
      }

      console.log("Message sent successfully, refreshing data");
      
      // Refresh conversations and messages
      await fetchConversations();
      
      if (conversationId) {
        await fetchMessages(conversationId);
      }

      // Reset the message input
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast("Error sending message");
      throw error; // Propagate the error for handling in the component
    }
  };

  const selectConversation = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
    if (conversation.id) {
      fetchMessages(conversation.id);
    } else {
      setMessages([]);
    }
  }, []);

  return {
    conversations,
    loading,
    activeConversation,
    messages,
    newMessage,
    loadingMessages,
    setActiveConversation: selectConversation,
    setNewMessage,
    sendMessage,
    fetchMessages,
    fetchConversations,
  };
};
