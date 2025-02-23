
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  is_pinned: boolean;
  is_reported: boolean;
  participants: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  }[];
  last_message?: {
    content: string;
    created_at: string;
  };
}

export const useConversations = (userId: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!userId) return;

    try {
      const { data: conversationsData, error: conversationsError } = await supabase
        .from("conversations")
        .select(`
          *,
          conversation_participants!inner(user_id),
          messages(
            content,
            created_at
          )
        `)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (conversationsError) throw conversationsError;

      // Fetch participants' profiles for each conversation
      const conversationsWithParticipants = await Promise.all(
        conversationsData.map(async (conv) => {
          const { data: participants, error: participantsError } = await supabase
            .from("conversation_participants")
            .select(`
              profiles:user_id (
                id,
                name,
                avatar_url
              )
            `)
            .eq("conversation_id", conv.id);

          if (participantsError) throw participantsError;

          return {
            ...conv,
            participants: participants.map((p) => ({
              id: p.profiles.id,
              name: p.profiles.name,
              avatar_url: p.profiles.avatar_url,
            })),
            last_message: conv.messages[conv.messages.length - 1],
          };
        })
      );

      setConversations(conversationsWithParticipants);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (conversationId: string) => {
    try {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (!conversation) return;

      const { error } = await supabase
        .from("conversations")
        .update({ is_pinned: !conversation.is_pinned })
        .eq("id", conversationId);

      if (error) throw error;

      setConversations(
        conversations.map((c) =>
          c.id === conversationId
            ? { ...c, is_pinned: !c.is_pinned }
            : c
        )
      );

      toast.success(
        conversation.is_pinned
          ? "Conversation unpinned"
          : "Conversation pinned"
      );
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast.error("Failed to update conversation");
    }
  };

  const archiveConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ is_archived: true })
        .eq("id", conversationId);

      if (error) throw error;

      setConversations(conversations.filter((c) => c.id !== conversationId));
      toast.success("Conversation archived");
    } catch (error) {
      console.error("Error archiving conversation:", error);
      toast.error("Failed to archive conversation");
    }
  };

  const reportConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ is_reported: true })
        .eq("id", conversationId);

      if (error) throw error;

      toast.success("Conversation reported");
    } catch (error) {
      console.error("Error reporting conversation:", error);
      toast.error("Failed to report conversation");
    }
  };

  useEffect(() => {
    fetchConversations();

    // Subscribe to changes
    const channel = supabase
      .channel("conversations-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    conversations,
    loading,
    togglePin,
    archiveConversation,
    reportConversation,
  };
};
