
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
      console.log(`Starting to fetch messages for conversation: ${conversationId}`);
      
      // Reset states at the beginning of fetch
      setLoadingMessages(true);
      setMessageError(false);
      setMessagesFetched(false);
      
      // Clear messages while loading
      setMessages([]);
      
      const messagesData = await fetchMessagesService(conversationId);
      
      console.log(`Successfully fetched ${messagesData.length} messages for conversation ${conversationId}`);
      
      if (Array.isArray(messagesData)) {
        setMessages(messagesData);
      } else {
        console.error("Fetched messages data is not an array:", messagesData);
        setMessages([]);
      }
      
    } catch (error) {
      console.error("Error fetching messages:", error);
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
        console.log(`Message ${message.id} already exists, not adding duplicate`);
        return prev;
      }
      console.log(`Adding new message ${message.id} to state`);
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
