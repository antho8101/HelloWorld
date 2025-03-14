
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
      console.log("[useRealtimeMessages] Not setting up realtime subscription - missing conversation ID or user ID");
      return;
    }

    console.log(`[useRealtimeMessages] Setting up realtime subscription for conversation: ${activeConversation.id}`);
    
    // Create a unique channel name for this conversation
    const channelName = `messages-channel-${activeConversation.id}`;
    
    // First, remove any existing channels for this conversation
    const existingChannels = supabase.getChannels();
    
    for (const channel of existingChannels) {
      if (channel.topic === `realtime:public:messages:conversation_id=eq.${activeConversation.id}`) {
        console.log(`[useRealtimeMessages] Removing existing channel for conversation: ${activeConversation.id}`);
        supabase.removeChannel(channel);
      }
    }
    
    // Then set up a new subscription
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
        async (payload) => {
          console.log('[useRealtimeMessages] New message received via realtime:', payload);
          
          // Skip messages from the current user as they've been added optimistically
          if (payload.new.sender_id === currentUserId) {
            console.log('[useRealtimeMessages] Message was from current user, already in state');
            return;
          }
          
          try {
            // Get profile data
            const { data: profile, error } = await supabase
              .from("profiles")
              .select("name, avatar_url")
              .eq("id", payload.new.sender_id)
              .maybeSingle();
              
            if (error) {
              console.error('[useRealtimeMessages] Error fetching profile for new message:', error);
            }
            
            // Create a complete message object
            const newMessage: Message = {
              id: payload.new.id,
              content: payload.new.content,
              created_at: payload.new.created_at,
              sender_id: payload.new.sender_id,
              sender_name: profile?.name || null,
              sender_avatar: profile?.avatar_url || null
            };
            
            console.log('[useRealtimeMessages] Adding new realtime message to state:', newMessage);
            addMessage(newMessage);
          } catch (error) {
            console.error('[useRealtimeMessages] Error in realtime message processing:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[useRealtimeMessages] Supabase channel status for conversation ${activeConversation.id}:`, status);
      });

    return () => {
      console.log(`[useRealtimeMessages] Removing realtime subscription for conversation: ${activeConversation.id}`);
      supabase.removeChannel(channel);
    };
  }, [activeConversation?.id, currentUserId, addMessage]);
};
