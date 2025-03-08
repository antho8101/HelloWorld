
import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";
import type { Conversation, Message } from "@/types/messages";
import { 
  fetchConversations as fetchConversationsService,
  createConversation
} from "@/services/conversation";
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
  const [sending, setSending] = useState(false);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId]);

  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      setFetchError(null);
      console.log("Fetching conversations for user:", currentUserId);
      const conversationsData = await fetchConversationsService(currentUserId);
      console.log("Fetched conversations:", conversationsData);
      setConversations(conversationsData);
    } catch (error) {
      console.error("Error in useMessages.fetchConversations:", error);
      setFetchError(error instanceof Error ? error : new Error("Failed to fetch conversations"));
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;
    
    try {
      setLoadingMessages(true);
      console.log("Fetching messages for conversation:", conversationId);
      const messagesData = await fetchMessagesService(conversationId);
      console.log("Fetched messages:", messagesData.length);
      setMessages(messagesData);
    } catch (error) {
      console.error("Error in useMessages.fetchMessages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const sendMessage = async (receiverId: string, content: string) => {
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
      const sentMessage = await sendMessageService(messageData);

      if (!sentMessage) {
        console.error("Failed to send message - API returned failure");
        throw new Error("Failed to send message");
      }

      console.log("Message sent successfully");
      
      // Add the new message to the list without a full refresh
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      
      // If this is a new conversation, we need to refresh the conversation list
      if (!activeConversation?.id || activeConversation?.isTemporary) {
        await fetchConversations();
        
        // Find the newly created conversation in the updated list
        const updatedConversation = conversations.find(c => c.id === conversationId);
        
        if (updatedConversation) {
          setActiveConversation(updatedConversation);
        }
      }

      // Reset the message input
      setNewMessage("");
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message. Please try again.");
      return false;
    } finally {
      setSending(false);
    }
  };

  const selectConversation = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
    if (conversation.id) {
      fetchMessages(conversation.id);
    } else {
      setMessages([]);
    }
  }, [fetchMessages]);

  return {
    conversations,
    loading,
    activeConversation,
    messages,
    newMessage,
    loadingMessages,
    sending,
    setActiveConversation: selectConversation,
    setNewMessage,
    sendMessage,
    fetchMessages,
    fetchConversations,
    error: fetchError,
  };
};
