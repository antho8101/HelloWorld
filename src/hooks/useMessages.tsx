
import { useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { useMessageState } from "@/hooks/messages/useMessageState";
import { useConversationState } from "@/hooks/messages/useConversationState";
import { useFetchConversations } from "@/hooks/messages/useFetchConversations";
import { useFetchMessages } from "@/hooks/messages/useFetchMessages";
import { useSendMessage } from "@/hooks/messages/useSendMessage";
import { useRealtimeMessages } from "@/hooks/messages/useRealtimeMessages";
import { useSelectConversation } from "@/hooks/messages/useSelectConversation";

export const useMessages = () => {
  const { currentUserId } = useSession();
  
  // Get state from individual hooks
  const {
    messages, setMessages,
    newMessage, setNewMessage,
    loadingMessages, setLoadingMessages,
    messagesFetched, setMessagesFetched,
    messageError, setMessageError,
    sending, setSending
  } = useMessageState();
  
  const {
    conversations, setConversations,
    activeConversation, setActiveConversation,
    loading, setLoading
  } = useConversationState();
  
  // Get functionality from individual hooks
  const { fetchConversations } = useFetchConversations(
    currentUserId, 
    setLoading, 
    setConversations
  );
  
  const { fetchMessages } = useFetchMessages(
    setLoadingMessages,
    setMessageError,
    setMessages,
    setMessagesFetched
  );
  
  const { sendMessage } = useSendMessage(
    currentUserId,
    activeConversation,
    setMessages,
    setSending,
    setNewMessage
  );
  
  // Setup realtime messages
  useRealtimeMessages(activeConversation, currentUserId, setMessages);
  
  // Setup conversation selection
  const { selectConversation } = useSelectConversation(
    setMessages,
    setMessagesFetched,
    setMessageError,
    setActiveConversation,
    fetchMessages
  );
  
  // Initial load of conversations
  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId, fetchConversations]);
  
  return {
    // State
    conversations,
    loading,
    activeConversation,
    messages,
    newMessage,
    loadingMessages,
    sending,
    messagesFetched,
    messageError,
    
    // Actions
    setActiveConversation: selectConversation,
    setNewMessage,
    sendMessage,
    fetchMessages,
    fetchConversations,
  };
};
