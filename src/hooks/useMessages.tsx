
import { useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { useMessageState } from "@/hooks/messages/useMessageState";
import { useConversationState } from "@/hooks/messages/useConversationState";
import { useFetchConversations } from "@/hooks/messages/useFetchConversations";
import { useFetchMessages } from "@/hooks/messages/useFetchMessages";
import { useSendMessage } from "@/hooks/messages/useSendMessage";
import { useRealtimeMessages } from "@/hooks/messages/useRealtimeMessages";

export const useMessages = () => {
  const { currentUserId } = useSession();
  
  // Get state from individual hooks
  const {
    newMessage, setNewMessage,
    sending, setSending
  } = useMessageState();
  
  const {
    conversations, setConversations,
    activeConversation, setActiveConversation,
    loading, setLoading
  } = useConversationState();
  
  // Use the refactored fetch messages hook
  const {
    messages,
    loadingMessages, 
    messageError, 
    messagesFetched,
    fetchMessages,
    addMessage,
    setMessages
  } = useFetchMessages();
  
  // Get functionality from individual hooks
  const { fetchConversations } = useFetchConversations(
    currentUserId, 
    setLoading, 
    setConversations
  );
  
  const { sendMessage } = useSendMessage(
    currentUserId,
    activeConversation,
    addMessage,
    setSending,
    setNewMessage
  );
  
  // Setup realtime messages
  useRealtimeMessages(activeConversation, currentUserId, addMessage);
  
  // Initial load of conversations
  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId, fetchConversations]);
  
  // When active conversation changes, fetch messages
  useEffect(() => {
    if (activeConversation?.id) {
      console.log(`Active conversation changed to ${activeConversation.id}, fetching messages`);
      fetchMessages(activeConversation.id);
    } else {
      // Reset messages when no active conversation
      setMessages([]);
    }
  }, [activeConversation?.id, fetchMessages, setMessages]);
  
  const selectConversation = (conversation: any) => {
    console.log("Selected conversation:", conversation.id);
    setActiveConversation(conversation);
  };
  
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
