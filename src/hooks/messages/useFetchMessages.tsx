
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { fetchMessages as fetchMessagesService } from "@/services/messageService";
import type { Message } from "@/types/messages";
import { supabase } from "@/integrations/supabase/client";

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
      
      // Get current user session to verify we're authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("[useFetchMessages] Current session:", sessionData?.session ? "Authenticated" : "Not authenticated");
      
      // Direct database query to check access
      const { data: participantCheck } = await supabase
        .from('conversation_participants')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', sessionData.session?.user.id || '')
        .limit(1);
      
      console.log(`[useFetchMessages] Participant check for conversation ${conversationId}:`, 
        participantCheck && participantCheck.length > 0 ? "User is participant" : "User is NOT participant");
      
      // Fetch messages
      const messagesData = await fetchMessagesService(conversationId);
      
      console.log(`[useFetchMessages] Messages fetch result: ${messagesData.length} messages retrieved`);
      if (messagesData.length > 0) {
        console.log("[useFetchMessages] First message:", messagesData[0]);
        console.log("[useFetchMessages] Last message:", messagesData[messagesData.length - 1]);
      }
      
      if (Array.isArray(messagesData)) {
        console.log(`[useFetchMessages] Setting ${messagesData.length} messages to state`);
        setMessages(messagesData);
      } else {
        console.error("[useFetchMessages] Fetched messages data is not an array:", messagesData);
        setMessages([]);
      }
      
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
