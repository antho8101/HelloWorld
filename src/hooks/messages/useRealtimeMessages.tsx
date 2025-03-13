
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
          
          // For any message, refresh the whole conversation
          fetchMessagesService(activeConversation.id as string)
            .then(updatedMessages => {
              console.log('Updated messages after realtime event:', updatedMessages);
              if (updatedMessages && updatedMessages.length > 0) {
                setMessages(updatedMessages);
              }
            })
            .catch(error => {
              console.error('Error fetching messages after realtime event:', error);
            });
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
