
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";
import type { Conversation, Message } from "@/types/messages";

export const useMessages = () => {
  const location = useLocation();
  const { currentUserId } = useSession();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [tempConversation, setTempConversation] = useState<any>(null);
  const [showNewConversationBanner, setShowNewConversationBanner] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Use useEffect to set profileId when selectedUserId changes
  useEffect(() => {
    setProfileId(selectedUserId);
  }, [selectedUserId]);

  // Récupérer les informations de la conversation temporaire du localStorage
  useEffect(() => {
    const storedConversation = localStorage.getItem('currentConversation');
    if (storedConversation) {
      try {
        const parsedConversation = JSON.parse(storedConversation);
        setTempConversation(parsedConversation);
      } catch (e) {
        console.error("Error parsing stored conversation:", e);
      }
    }
  }, []);

  useEffect(() => {
    // Check if we have a conversationId from navigation state
    const stateConversationId = location.state?.conversationId;
    const stateOtherUserId = location.state?.otherUserId;
    
    if (stateConversationId) {
      setCurrentConversationId(stateConversationId);
      
      if (stateOtherUserId) {
        setSelectedUserId(stateOtherUserId);
      }
    }
    
    if (currentUserId) {
      fetchConversations();
    }
  }, [location, currentUserId]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      fetchMessages(currentConversationId);
    }
  }, [currentConversationId]);

  const fetchConversations = async () => {
    if (!currentUserId) return;
    
    try {
      // First get all conversation IDs where the current user is a participant
      const { data: participations, error: participationError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId);

      if (participationError) {
        console.error('Error fetching participations:', participationError);
        return;
      }
      
      if (!participations || participations.length === 0) {
        setConversations([]);
        return;
      }

      // Extract conversation IDs
      const conversationIds = participations.map(p => p.conversation_id);
      
      // Get conversation details
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at,
          is_pinned,
          is_archived
        `)
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        return;
      }
      
      // For each conversation, get the other participant
      const conversationsWithParticipants = await Promise.all(
        (conversationsData || []).map(async (conversation) => {
          // Get the other participant in this conversation
          const { data: otherParticipants, error: otherParticipantError } = await supabase
            .from('conversation_participants')
            .select(`
              user_id,
              profiles:user_id(
                id,
                name,
                avatar_url
              )
            `)
            .eq('conversation_id', conversation.id)
            .neq('user_id', currentUserId);

          if (otherParticipantError) {
            console.error('Error fetching other participant:', otherParticipantError);
            return {
              ...conversation,
              otherParticipant: null
            };
          }

          let otherParticipant: Conversation['otherParticipant'] = null;
          
          if (otherParticipants && otherParticipants.length > 0) {
            const participant = otherParticipants[0];
            
            // First check if participant exists and has user_id
            if (participant && participant.user_id) {
              // If we at least have a user_id, create a minimal participant
              otherParticipant = {
                id: participant.user_id,
                name: null,
                avatar_url: null
              };
              
              // Then, if profiles data is available, enhance the participant with that data
              if (participant.profiles) {
                // Need an additional null check to satisfy TypeScript
                const profiles = participant.profiles;
                
                if (profiles && typeof profiles === 'object' && !('error' in profiles)) {
                  // Make sure profile values are not null before accessing them
                  const profileId = profiles.id;
                  const profileName = profiles.name;
                  const profileAvatar = profiles.avatar_url;
                  
                  otherParticipant = {
                    id: typeof profileId === 'string' ? profileId : String(profileId || participant.user_id),
                    name: profileName || null,
                    avatar_url: profileAvatar || null
                  };
                }
              }
            }
          }

          const result: Conversation = {
            ...conversation,
            otherParticipant
          };

          return result;
        })
      );
      
      setConversations(conversationsWithParticipants);
      
      // Si nous avons un ID de conversation de navigation, le sélectionner
      if (location.state?.conversationId && conversationsWithParticipants.length) {
        setCurrentConversationId(location.state.conversationId);
        // Supprimer les conversations temporaires du localStorage une fois qu'on a trouvé une conversation réelle
        localStorage.removeItem('currentConversation');
      } else if (conversationsWithParticipants.length) {
        // Sinon, sélectionner la première conversation
        setCurrentConversationId(conversationsWithParticipants[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!conversationId) return;
    
    setIsLoadingMessages(true);
    
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles:sender_id(
            name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        setCurrentMessages([]);
        return;
      }
      
      // Format messages with profile data
      const formattedMessages = messagesData?.map(msg => {
        // Add proper null checking for profiles
        const profileData = msg.profiles ? 
          // Check if profiles is an error or an object with data
          ('error' in msg.profiles ? { name: null, avatar_url: null } : msg.profiles)
          : { name: null, avatar_url: null };
        
        return {
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          sender_id: msg.sender_id,
          sender_name: profileData.name,
          sender_avatar: profileData.avatar_url
        };
      }) || [];
      
      setCurrentMessages(formattedMessages);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      setCurrentMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (message.trim() && currentConversationId && currentUserId) {
      try {
        // Insert the message into the database
        const { data, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: currentConversationId,
            sender_id: currentUserId,
            content: message.trim()
          })
          .select();
          
        if (error) {
          console.error('Error sending message:', error);
          toast({
            variant: "destructive",
            title: "Failed to Send",
            description: "There was an error sending your message. Please try again."
          });
          return false;
        }
        
        // Fetch the latest messages to update the UI
        fetchMessages(currentConversationId);
        
        // Masquer le bandeau de nouvelle conversation après l'envoi du premier message
        setShowNewConversationBanner(false);
        
        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully.",
        });
        
        return true;
      } catch (error) {
        console.error('Error in sendMessage:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong. Please try again later."
        });
        return false;
      }
    }
    return false;
  };

  // Mock online status for demo purposes - in a real app, this would come from your backend
  const mockOnlineStatus = (userId: string) => {
    const userIds = ["user1", "user3", "user5"];
    return userIds.includes(userId);
  };

  return {
    selectedUserId,
    setSelectedUserId,
    conversations,
    currentConversationId,
    setCurrentConversationId,
    currentMessages,
    tempConversation,
    showNewConversationBanner,
    setShowNewConversationBanner,
    isLoadingMessages,
    profileId,
    fetchConversations,
    fetchMessages,
    sendMessage,
    mockOnlineStatus,
    currentUserId
  };
};
