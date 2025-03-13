
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
    if (!activeConversation?.id || !currentUserId) {
      console.log("Not setting up realtime subscription - missing conversation ID or user ID");
      return;
    }

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
          
          // Check if this message is from the current user
          const isFromCurrentUser = payload.new.sender_id === currentUserId;
          
          if (isFromCurrentUser) {
            console.log('Message was from current user, already in state');
            return; // Skip updating messages - we've already optimistically added it
          }
          
          // For messages from other users, refresh the whole conversation
          console.log('Message from another user, refreshing conversation data');
          fetchMessagesService(activeConversation.id as string)
            .then(updatedMessages => {
              console.log('Updated messages after realtime event:', updatedMessages.length);
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
