
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";
import type { Conversation, Message, MessageData } from "@/types/messages";

export const useMessages = () => {
  const { currentUserId } = useSession();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId]);

  const fetchConversations = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("conversation_participants")
        .select(`
          conversation_id,
          conversation:conversation_id (
            id,
            created_at,
            updated_at,
            is_pinned,
            is_archived
          ),
          participants:conversation_id (
            user_id,
            profile:user_id (
              id,
              name,
              username,
              avatar_url
            )
          )
        `)
        .eq("user_id", currentUserId);

      if (error) throw error;

      // Transform data into conversations array
      const transformedConversations: Conversation[] = [];

      if (data) {
        for (const item of data) {
          if (!item.conversation) continue;

          // Find participants other than current user
          const participants = Array.isArray(item.participants) 
            ? item.participants.filter((p: any) => p.user_id !== currentUserId && p.profile)
            : [];
          
          // Get the other user's profile
          const otherUserProfile = participants.length > 0 ? participants[0].profile : null;

          if (otherUserProfile) {
            transformedConversations.push({
              id: item.conversation.id,
              userId: otherUserProfile.id,
              name: otherUserProfile.name || otherUserProfile.username || "User",
              avatar: otherUserProfile.avatar_url,
              lastMessage: "",
              timestamp: item.conversation.updated_at,
              isPinned: item.conversation.is_pinned,
              isArchived: item.conversation.is_archived,
            });
          }
        }
      }

      // Sort conversations by timestamp (newest first)
      transformedConversations.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setConversations(transformedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast("Error loading conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!conversationId) return;
    
    try {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          content,
          created_at,
          sender_id,
          sender:sender_id (
            name,
            avatar_url
          )
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const fetchedMessages: Message[] = [];
      if (data) {
        for (const item of data) {
          const senderData = item.sender || { name: null, avatar_url: null };
          fetchedMessages.push({
            id: item.id,
            text: item.content,
            senderId: item.sender_id,
            senderName: senderData.name || "Unknown",
            senderAvatar: senderData.avatar_url,
            timestamp: item.created_at,
            isMine: item.sender_id === currentUserId
          });
        }
      }

      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast("Error loading messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    if (!currentUserId || !content.trim()) return;

    try {
      let conversationId = activeConversation?.id;

      // If no active conversation, create a new one
      if (!conversationId) {
        // Check if a conversation already exists with this user
        const existingConv = conversations.find(c => c.userId === receiverId);
        if (existingConv) {
          conversationId = existingConv.id;
        } else {
          // Create a new conversation
          const { data: newConv, error: convError } = await supabase
            .from("conversations")
            .insert({})
            .select("id")
            .single();

          if (convError) throw convError;
          
          conversationId = newConv.id;

          // Add participants to the conversation
          const participants = [
            { conversation_id: conversationId, user_id: currentUserId },
            { conversation_id: conversationId, user_id: receiverId }
          ];

          const { error: participantsError } = await supabase
            .from("conversation_participants")
            .insert(participants);

          if (participantsError) throw participantsError;
        }
      }

      // Send the message
      const messageData: MessageData = {
        content,
        conversation_id: conversationId,
        sender_id: currentUserId
      };

      const { error: messageError } = await supabase
        .from("messages")
        .insert(messageData);

      if (messageError) throw messageError;

      // Refresh conversations and messages
      await fetchConversations();
      if (conversationId) {
        await fetchMessages(conversationId);
      }

      // Reset the message input
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast("Error sending message");
    }
  };

  const selectConversation = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
    fetchMessages(conversation.id);
  }, []);

  return {
    conversations,
    loading,
    activeConversation,
    messages,
    newMessage,
    loadingMessages,
    setActiveConversation: selectConversation,
    setNewMessage,
    sendMessage,
    fetchMessages,
    fetchConversations,
  };
};
