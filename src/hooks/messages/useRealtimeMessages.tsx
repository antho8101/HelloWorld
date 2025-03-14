
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Conversation, Message } from "@/types/messages";

export const useRealtimeMessages = (
  activeConversation: Conversation | null,
  currentUserId: string | null,
  addMessage: (message: Message) => void
) => {
  useEffect(() => {
    if (!activeConversation?.id || !currentUserId) {
      console.log("Not setting up realtime subscription - missing conversation ID or user ID");
      return;
    }

    console.log(`Setting up realtime subscription for conversation: ${activeConversation.id}`);
    
    // Create a channel name using conversation ID to ensure uniqueness
    const channelName = `messages-${activeConversation.id}`;
    
    // Subscribe to changes on the messages table for the active conversation
    const channel = supabase
      .channel(channelName)
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
          
          // Skip our own messages, as they've been added optimistically
          if (payload.new.sender_id === currentUserId) {
            console.log('Message was from current user, already in state');
            return;
          }
          
          // For messages from other users, add them to the state
          console.log('Adding new message from another user to state');
          
          // Get profile data and construct message
          const getProfileAndAddMessage = async () => {
            try {
              const { data: profile, error } = await supabase
                .from("profiles")
                .select("name, avatar_url")
                .eq("id", payload.new.sender_id)
                .single();
                
              if (error) {
                console.error('Error fetching profile for new message:', error);
                return;
              }
              
              // Create a full message object
              const newMessage: Message = {
                id: payload.new.id,
                content: payload.new.content,
                created_at: payload.new.created_at,
                sender_id: payload.new.sender_id,
                sender_name: profile?.name || null,
                sender_avatar: profile?.avatar_url || null
              };
              
              // Add the message to the state
              addMessage(newMessage);
            } catch (error) {
              console.error('Error in realtime message processing:', error);
            }
          };
          
          // Execute the async function
          getProfileAndAddMessage();
        }
      )
      .subscribe((status) => {
        console.log(`Supabase channel status for conversation ${activeConversation.id}:`, status);
      });

    return () => {
      console.log(`Removing realtime subscription for conversation: ${activeConversation.id}`);
      supabase.removeChannel(channel);
    };
  }, [activeConversation?.id, currentUserId, addMessage]);
};
