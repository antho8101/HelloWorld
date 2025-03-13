
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
      
      // Log full response for debugging
      console.log("Message fetch response:", messagesData);
      
      if (Array.isArray(messagesData)) {
        console.log("Fetched", messagesData.length, "messages for conversation", conversationId);
        // Filter out any null entries that might be in the response
        const validMessages = messagesData.filter(msg => msg && msg.id) as Message[];
        // Set messages state and mark as fetched
        setMessages(validMessages);
        setMessagesFetched(true);
      } else {
        console.error("Invalid message data returned:", messagesData);
        setMessages([]);
        setMessageError(true);
        toast.error("Invalid message data returned");
      }
    } catch (error) {
      console.error("Error in useFetchMessages:", error);
      toast.error("Could not load messages. Please try again.");
      setMessageError(true);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [setLoadingMessages, setMessageError, setMessages, setMessagesFetched]);

  return { fetchMessages };
};
