
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
      console.log("Fetched conversations:", conversationsData);
      setConversations(conversationsData);
    } catch (error) {
      console.error("Error in useFetchConversations:", error);
      toast.error("Could not load conversations");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, setLoading, setConversations]);

  return { fetchConversations };
};
