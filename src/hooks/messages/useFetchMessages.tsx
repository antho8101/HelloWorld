
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
      console.log("No conversation ID provided to fetchMessages");
      setMessages([]);
      setMessagesFetched(true);
      return;
    }
    
    try {
      // Reset states at the beginning of fetch
      setLoadingMessages(true);
      setMessageError(false);
      setMessagesFetched(false);
      
      console.log(`Starting to fetch messages for conversation: ${conversationId}`);
      
      const messagesData = await fetchMessagesService(conversationId);
      
      console.log(`Successfully fetched ${messagesData.length} messages for conversation ${conversationId}`);
      
      // Set messages and mark as fetched
      setMessages(messagesData);
      setMessagesFetched(true);
      
    } catch (error) {
      console.error("Error in useFetchMessages:", error);
      setMessageError(true);
      setMessages([]);
      toast.error("Could not load messages");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
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
