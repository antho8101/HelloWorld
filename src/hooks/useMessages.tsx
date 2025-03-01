
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";
import type { Conversation, Message } from "@/types/messages";

interface MessagePayload {
  content: string;
  conversation_id: string;
  sender_id: string;
}

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
          conversation:conversations!inner(
            id,
            created_at,
            updated_at,
            is_pinned,
            is_archived
          )
        `)
        .eq("user_id", currentUserId);

      if (error) throw error;

      if (!data || data.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get all conversation IDs
      const conversationIds = data.map(item => item.conversation_id);

      // For each conversation, find the other participant
      const conversationsWithParticipants: Conversation[] = [];

      for (const conversationId of conversationIds) {
        // Get other participants for this conversation
        const { data: participantsData, error: participantsError } = await supabase
          .from("conversation_participants")
          .select(`
            user_id,
            profiles:profiles(
              id,
              name,
              avatar_url
            )
          `)
          .eq("conversation_id", conversationId)
          .neq("user_id", currentUserId);

        if (participantsError) {
          console.error("Error fetching participants:", participantsError);
          continue;
        }

        const conversationInfo = data.find(item => item.conversation_id === conversationId)?.conversation;
        
        if (!conversationInfo) continue;

        // Get the other participant's profile
        const otherParticipant = participantsData.length > 0 ? participantsData[0].profiles : null;
        let participantProfile = null;

        if (otherParticipant && typeof otherParticipant === 'object') {
          // Make sure this is not a SelectQueryError by checking for expected properties
          if ('id' in otherParticipant) {
            participantProfile = {
              id: otherParticipant.id,
              name: otherParticipant.name,
              avatar_url: otherParticipant.avatar_url
            };
          }
        }

        conversationsWithParticipants.push({
          id: conversationId,
          created_at: conversationInfo.created_at,
          updated_at: conversationInfo.updated_at,
          is_pinned: conversationInfo.is_pinned,
          is_archived: conversationInfo.is_archived,
          otherParticipant: participantProfile
        });
      }

      // Sort conversations by updated_at (newest first)
      conversationsWithParticipants.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setConversations(conversationsWithParticipants);
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
          sender:profiles(
            name,
            avatar_url
          )
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const fetchedMessages: Message[] = data.map(item => {
        // Check if sender exists and has expected properties to avoid SelectQueryError issues
        let senderName = null;
        let senderAvatar = null;
        
        if (item.sender && typeof item.sender === 'object') {
          // Use optional chaining to safely access potentially null properties
          if ('name' in item.sender) {
            senderName = item.sender?.name;
          }
          if ('avatar_url' in item.sender) {
            senderAvatar = item.sender?.avatar_url;
          }
        }
        
        return {
          id: item.id,
          content: item.content,
          created_at: item.created_at,
          sender_id: item.sender_id,
          sender_name: senderName,
          sender_avatar: senderAvatar
        };
      });

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

      // Send the message
      const messageData: MessagePayload = {
        content,
        conversation_id: conversationId,
        sender_id: currentUserId
      };

      const { error: messageError } = await supabase
        .from("messages")
        .insert(messageData);

      if (messageError) throw messageError;

      // Update the timestamp on the conversation
      const { error: updateError } = await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      if (updateError) console.error("Error updating conversation timestamp:", updateError);

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
    if (conversation.id) {
      fetchMessages(conversation.id);
    } else {
      setMessages([]);
    }
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
