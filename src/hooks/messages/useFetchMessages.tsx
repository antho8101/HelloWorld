
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { fetchMessages as fetchMessagesService } from "@/services/messageService";
import type { Message } from "@/types/messages";

export const useFetchMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState(false);
  const [messagesFetched, setMessagesFetched] = useState(false);
  
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) {
      console.log("[useFetchMessages] No conversation ID provided to fetchMessages");
      setMessages([]);
      setMessagesFetched(true);
      return;
    }
    
    try {
      console.log(`[useFetchMessages] Starting to fetch messages for conversation: ${conversationId}`);
      
      // Reset states at the beginning of fetch
      setLoadingMessages(true);
      setMessageError(false);
      setMessagesFetched(false);
      
      // Clear messages while loading
      setMessages([]);
      
      // Utiliser notre service mis à jour qui utilise la fonction SQL sécurisée
      const messagesData = await fetchMessagesService(conversationId);
      
      console.log(`[useFetchMessages] Messages fetch result: ${messagesData.length} messages retrieved`);
      if (messagesData.length > 0) {
        console.log("[useFetchMessages] First message:", messagesData[0]);
        console.log("[useFetchMessages] Last message:", messagesData[messagesData.length - 1]);
      }
      
      setMessages(messagesData);
      
    } catch (error) {
      console.error("[useFetchMessages] Error fetching messages:", error);
      setMessageError(true);
      setMessages([]);
      toast.error("Could not load messages");
    } finally {
      setLoadingMessages(false);
      setMessagesFetched(true);
    }
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      // Check if message with this ID already exists
      const exists = prev.some(m => m.id === message.id);
      if (exists) {
        console.log(`[useFetchMessages] Message ${message.id} already exists, not adding duplicate`);
        return prev;
      }
      console.log(`[useFetchMessages] Adding new message ${message.id} to state`);
      return [...prev, message];
    });
  }, []);
  
  return { 
    messages, 
    loadingMessages, 
    messageError, 
    messagesFetched,
    fetchMessages,
    addMessage,
    setMessages 
  };
};
