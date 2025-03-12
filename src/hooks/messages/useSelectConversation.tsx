
import { useCallback } from "react";
import type { Conversation } from "@/types/messages";

export const useSelectConversation = (
  setMessages: (messages: any[]) => void,
  setMessagesFetched: (fetched: boolean) => void,
  setMessageError: (error: boolean) => void,
  setActiveConversation: (conversation: Conversation) => void,
  fetchMessages: (conversationId: string) => Promise<void>
) => {
  const selectConversation = useCallback((conversation: Conversation) => {
    console.log("Setting active conversation:", conversation);
    
    // Reset message state when changing conversations
    setMessages([]);
    setMessagesFetched(false);
    setMessageError(false);
    setActiveConversation(conversation);
    
    if (conversation.id) {
      console.log("Will fetch messages for conversation:", conversation.id);
      // Reset before fetching to avoid stale data
      fetchMessages(conversation.id);
    } else {
      console.log("No conversation ID, clearing messages");
      setMessages([]);
    }
  }, [fetchMessages, setMessages, setMessagesFetched, setMessageError, setActiveConversation]);

  return { selectConversation };
};
