
import { useState } from "react";
import type { Conversation } from "@/types/messages";

export const useConversationState = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  return {
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    loading,
    setLoading
  };
};
