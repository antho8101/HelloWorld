import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useSession } from "./useSession";
import { toast } from "sonner";
import type { Conversation, Message, ConversationParticipant } from "@/types/messages";

export const useMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const { currentUserId } = useSession();
  const navigate = useNavigate();

  // Fetch conversations from Supabase
  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      
      // Get conversations where the current user is a participant
      const { data: conversationsData, error: conversationsError } = await supabase
        .from("conversations")
        .select(`
          id,
          created_at,
          updated_at,
          participants!inner(user_id, profile_id),
          is_archived,
          is_pinned
        `)
        .or(`participants.user_id.eq.${currentUserId}`)
        .order("updated_at", { ascending: false });

      if (conversationsError) throw conversationsError;

      if (!conversationsData) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // For each conversation, get the other participant's details
      const conversationsWithProfiles = await Promise.all(
        conversationsData.map(async (conversation) => {
          // Find participant that isn't the current user
          const otherParticipant = conversation.participants.find(
            (p: any) => p.user_id !== currentUserId
          );

          if (!otherParticipant) {
            return {
              ...conversation,
              otherParticipant: null
            };
          }

          // Get profile of other participant
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, name, avatar_url")
            .eq("id", otherParticipant.profile_id)
            .single();

          return {
            id: conversation.id,
            created_at: conversation.created_at,
            updated_at: conversation.updated_at,
            is_pinned: conversation.is_pinned || false,
            is_archived: conversation.is_archived || false,
            otherParticipant: profileData || null
          };
        })
      );

      setConversations(conversationsWithProfiles);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Fetch messages for a particular conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!currentUserId) return;

    try {
      setLoadingMessages(true);
      
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles:sender_id (
            name,
            avatar_url
          )
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      if (!messagesData) {
        setMessages([]);
        setLoadingMessages(false);
        return;
      }

      const formattedMessages = messagesData.map((message) => ({
        id: message.id,
        content: message.content,
        created_at: message.created_at,
        sender_id: message.sender_id,
        sender_name: message.profiles?.name || "Unknown",
        sender_avatar: message.profiles?.avatar_url || null
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }, [currentUserId]);

  // Set active conversation and fetch its messages
  const setConversationActive = useCallback(async (conversation: Conversation) => {
    setActiveConversation(conversation);
    await fetchMessages(conversation.id);
  }, [fetchMessages]);

  // Send a new message
  const sendMessage = useCallback(async () => {
    if (!currentUserId || !activeConversation || !newMessage.trim()) return;

    try {
      setSendingMessage(true);
      
      // Insert new message
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: activeConversation.id,
          sender_id: currentUserId,
          content: newMessage.trim()
        })
        .select();

      if (messageError) throw messageError;

      // Update conversation's updated_at
      const { error: updateError } = await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeConversation.id);

      if (updateError) throw updateError;

      // Clear message input
      setNewMessage("");
      
      // Fetch messages to update the UI
      await fetchMessages(activeConversation.id);
    } catch (error) {
      console.error("Error sending message:", error);
      toast("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  }, [currentUserId, activeConversation, newMessage, fetchMessages]);

  // Start a conversation with a user
  const startConversation = useCallback(async (userId: string) => {
    if (!currentUserId) {
      toast("You need to be logged in to send messages");
      navigate("/login");
      return;
    }

    if (userId === currentUserId) {
      toast("You cannot message yourself");
      return;
    }

    try {
      // Check if a conversation already exists
      const { data: existingConvData, error: existingConvError } = await supabase
        .from("conversations")
        .select(`
          id,
          participants!inner(user_id, profile_id)
        `)
        .or(`and(participants.user_id.eq.${currentUserId},participants.profile_id.eq.${userId}),and(participants.user_id.eq.${userId},participants.profile_id.eq.${currentUserId})`)
        .limit(1);

      if (existingConvError) throw existingConvError;

      // If conversation exists, navigate to it
      if (existingConvData && existingConvData.length > 0) {
        navigate(`/messages?conversation=${existingConvData[0].id}`);
        return;
      }

      // Otherwise, create a new conversation
      const { data: newConvData, error: newConvError } = await supabase
        .from("conversations")
        .insert({})
        .select();

      if (newConvError) throw newConvError;
      
      if (!newConvData || newConvData.length === 0) {
        throw new Error("Failed to create conversation");
      }

      // Add participants
      const { error: participantsError } = await supabase
        .from("participants")
        .insert([
          { conversation_id: newConvData[0].id, user_id: currentUserId, profile_id: userId },
          { conversation_id: newConvData[0].id, user_id: userId, profile_id: currentUserId }
        ]);

      if (participantsError) throw participantsError;

      // Navigate to new conversation
      navigate(`/messages?conversation=${newConvData[0].id}`);
      
      toast("Conversation started");
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast("Failed to start conversation");
    }
  }, [currentUserId, navigate]);

  // Initial load
  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId, fetchConversations]);

  // Setup real-time updates for messages
  useEffect(() => {
    if (!activeConversation) return;

    const channel = supabase
      .channel(`messages:${activeConversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConversation.id}`
      }, (payload) => {
        console.log('New message received:', payload);
        fetchMessages(activeConversation.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, fetchMessages]);

  return {
    conversations,
    loading,
    activeConversation,
    messages,
    newMessage,
    loadingMessages,
    sendingMessage,
    setNewMessage,
    setConversationActive,
    sendMessage,
    startConversation,
    fetchConversations
  };
};
