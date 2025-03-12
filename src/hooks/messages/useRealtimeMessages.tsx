
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchMessages as fetchMessagesService } from "@/services/messageService";
import type { Conversation, Message } from "@/types/messages";

export const useRealtimeMessages = (
  activeConversation: Conversation | null,
  currentUserId: string | null,
  setMessages: (messages: Message[] | ((prevMessages: Message[]) => Message[])) => void
) => {
  useEffect(() => {
    if (!activeConversation?.id) return;

    console.log(`Setting up realtime subscription for conversation: ${activeConversation.id}`);
    
    // Subscribe to changes on the messages table for the active conversation
    const channel = supabase
      .channel(`messages-${activeConversation.id}`)
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation.id}`
        }, 
        (payload) => {
          console.log('New message received via realtime:', payload);
          // If the message is from another user (not the current user sending), add it
          if (payload.new && payload.new.sender_id !== currentUserId) {
            // Fetch the full message with sender details
            fetchMessagesService(activeConversation.id as string)
              .then(updatedMessages => {
                console.log('Updated messages after realtime event:', updatedMessages);
                setMessages(updatedMessages);
              });
          }
        }
      )
      .subscribe((status) => {
        console.log(`Supabase channel status for conversation ${activeConversation.id}:`, status);
      });

    return () => {
      console.log(`Removing realtime subscription for conversation: ${activeConversation.id}`);
      supabase.removeChannel(channel);
    };
  }, [activeConversation?.id, currentUserId, setMessages]);
};
