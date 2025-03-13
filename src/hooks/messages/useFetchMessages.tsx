
import { useCallback } from "react";
import { toast } from "sonner";
import { fetchMessages as fetchMessagesService } from "@/services/messageService";
import type { Message } from "@/types/messages";

export const useFetchMessages = (
  setLoadingMessages: (loading: boolean) => void,
  setMessageError: (error: boolean) => void,
  setMessages: (messages: Message[]) => void,
  setMessagesFetched: (fetched: boolean) => void
) => {
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) {
      console.log("No conversation ID provided to fetchMessages");
      setMessages([]);
      return;
    }
    
    try {
      setLoadingMessages(true);
      setMessageError(false);
      console.log("Fetching messages for conversation:", conversationId);
      
      const messagesData = await fetchMessagesService(conversationId);
      
      // Log the response for debugging
      console.log("Messages fetched:", messagesData.length);
      
      // Set messages state and mark as fetched
      setMessages(messagesData);
      setMessagesFetched(true);
      
    } catch (error) {
      console.error("Error in useFetchMessages:", error);
      setMessageError(true);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [setLoadingMessages, setMessageError, setMessages, setMessagesFetched]);

  return { fetchMessages };
};
