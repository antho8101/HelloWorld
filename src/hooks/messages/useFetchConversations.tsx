import { useCallback } from "react";
import { toast } from "sonner";
import { fetchConversations as fetchConversationsService } from "@/services/conversation";

export const useFetchConversations = (
  currentUserId: string | null,
  setLoading: (loading: boolean) => void,
  setConversations: (conversations: any[]) => void
) => {
  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      console.log("Fetching conversations for user:", currentUserId);
      const conversationsData = await fetchConversationsService(currentUserId);
      
      // Ensure there are no duplicate conversations with the same other user
      const uniqueConversations = removeDuplicateConversations(conversationsData);
      
      console.log("Fetched conversations:", uniqueConversations);
      setConversations(uniqueConversations);
    } catch (error) {
      console.error("Error in useFetchConversations:", error);
      toast.error("Could not load conversations");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, setLoading, setConversations]);

  // Helper function to remove duplicate conversations with the same user
  const removeDuplicateConversations = (conversations: any[]) => {
    const userIdMap = new Map();
    const uniqueConversations = [];

    // Sort by last message time to keep the most recent conversation
    const sortedConversations = [...conversations].sort((a, b) => {
      const timeA = a.latest_message_time || a.updated_at;
      const timeB = b.latest_message_time || b.updated_at;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });

    // Keep only the most recent conversation with each user
    for (const conversation of sortedConversations) {
      const otherUserId = conversation.otherParticipant?.id;
      
      if (otherUserId && !userIdMap.has(otherUserId)) {
        userIdMap.set(otherUserId, true);
        uniqueConversations.push(conversation);
      }
    }

    return uniqueConversations;
  };

  return { fetchConversations };
};
