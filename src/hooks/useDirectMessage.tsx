
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Conversation } from "@/types/messages";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createNewConversation } from "@/services/profileMessagingService";

export const useDirectMessage = (
  otherUserId: string | undefined,
  currentUserId: string | null,
  conversations: Conversation[],
  setActiveConversation: (conversation: Conversation) => void,
  fetchConversations: () => Promise<void>
) => {
  const [initializing, setInitializing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUserId || !otherUserId || initializing) return;
    
    handleDirectMessage(otherUserId);
  }, [otherUserId, conversations, currentUserId, initializing]);

  const handleDirectMessage = async (otherUserId: string) => {
    if (!currentUserId) return;
    
    setInitializing(true);
    console.log('Handling direct message with user:', otherUserId);
    
    try {
      // Find existing conversation
      const existingConversation = conversations.find(c => 
        c.otherParticipant && c.otherParticipant.id === otherUserId
      );
      
      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation.id);
        setActiveConversation(existingConversation);
      } else {
        console.log('No existing conversation found, creating temporary placeholder');
        
        // First, attempt to check if a conversation already exists at the database level
        // by querying both participants together
        const { data: existingParticipations, error: participationsError } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", currentUserId);
        
        if (participationsError) {
          console.error('Error checking existing participations:', participationsError);
          toast("Error checking existing conversations");
          return;
        }
        
        // If current user has any conversations
        if (existingParticipations && existingParticipations.length > 0) {
          const conversationIds = existingParticipations.map(p => p.conversation_id);
          
          // Check if other user is in any of those conversations
          const { data: sharedConversations, error: sharedError } = await supabase
            .from("conversation_participants")
            .select("conversation_id")
            .eq("user_id", otherUserId)
            .in("conversation_id", conversationIds);
          
          if (sharedError) {
            console.error('Error checking shared conversations:', sharedError);
          } else if (sharedConversations && sharedConversations.length > 0) {
            // Conversation exists but wasn't in our client-side list
            // Refresh conversations to get the full data
            console.log('Found conversation at database level, refreshing list');
            await fetchConversations();
            
            // Find conversation in refreshed list
            const refreshedList = conversations.find(c => 
              c.id === sharedConversations[0].conversation_id
            );
            
            if (refreshedList) {
              setActiveConversation(refreshedList);
              setInitializing(false);
              return;
            }
          }
        }
        
        // Get profile info for temp conversation
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, avatar_url, age, country')
          .eq('id', otherUserId)
          .single();
          
        const name = profileData?.name || "User";
        const avatar_url = profileData?.avatar_url || null;
        const age = profileData?.age || null;
        const country = profileData?.country || null;
        
        // Create temporary conversation for UI
        const newConversationPlaceholder = {
          id: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_pinned: false,
          is_archived: false,
          otherParticipant: {
            id: otherUserId,
            name,
            avatar_url,
            age,
            country
          },
          isTemporary: true
        };
        
        setActiveConversation(newConversationPlaceholder);
        
        // Try to create actual conversation in background
        createNewConversation(currentUserId, otherUserId)
          .then(newConversationId => {
            if (newConversationId) {
              console.log('Created new conversation in background, refreshing data');
              fetchConversations();
            }
          })
          .catch(error => {
            console.error('Error creating conversation in background:', error);
          });
      }
    } catch (error) {
      console.error('Error setting up conversation:', error);
      toast("Error setting up conversation");
    } finally {
      // Clear navigation state
      navigate('/messages', { 
        state: {}, 
        replace: true 
      });
      setInitializing(false);
    }
  };

  return { initializing };
};
