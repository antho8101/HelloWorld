
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
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUserId || !otherUserId || initializing) return;
    
    handleDirectMessage(otherUserId);
  }, [otherUserId, conversations, currentUserId, initializing]);

  const handleDirectMessage = async (otherUserId: string) => {
    if (!currentUserId) return;
    
    setInitializing(true);
    setError(null);
    console.log('Handling direct message with user:', otherUserId);
    
    try {
      // Find existing conversation
      const existingConversation = conversations.find(c => 
        c.otherParticipant && c.otherParticipant.id === otherUserId
      );
      
      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation.id);
        setActiveConversation(existingConversation);
        
        // Ensure this conversation appears in the URL
        navigate(`/messages/${existingConversation.id}`, { replace: true });
      } else {
        console.log('No existing conversation found, creating temporary placeholder');
        
        // Get profile info for temp conversation
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name, avatar_url, age, country')
          .eq('id', otherUserId)
          .maybeSingle();
          
        if (profileError) {
          console.error('Error fetching profile data:', profileError);
          throw new Error('Could not load user profile information');
        }
          
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
            country,
            is_online: false
          },
          isTemporary: true,
          latest_message: null,
          latest_message_time: null,
          unread_count: 0
        };
        
        setActiveConversation(newConversationPlaceholder);
        
        // Try to create actual conversation in background
        try {
          const newConversationId = await createNewConversation(currentUserId, otherUserId);
          
          if (newConversationId) {
            console.log('Created new conversation in background, refreshing data');
            await fetchConversations();
            
            // Navigate to the new conversation
            navigate(`/messages/${newConversationId}`, { replace: true });
          } else {
            throw new Error('Failed to create conversation');
          }
        } catch (convError) {
          console.error('Error creating conversation in background:', convError);
          // We still show the placeholder, but we'll track the error
          setError(convError instanceof Error ? convError : new Error('Unknown error creating conversation'));
          // Don't throw here, we want to continue with the placeholder
        }
      }
    } catch (error) {
      console.error('Error setting up conversation:', error);
      toast("Error setting up conversation");
      setError(error instanceof Error ? error : new Error('Unknown error setting up conversation'));
    } finally {
      setInitializing(false);
    }
  };

  return { initializing, error };
};
