
import React, { useEffect, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/landing/Header";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { ConversationHeader } from "@/components/messages/ConversationHeader";
import { useMessages } from "@/hooks/useMessages";
import { useSession } from "@/hooks/useSession";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { createNewConversation } from "@/services/profileMessagingService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Messages = () => {
  const { 
    conversations, 
    loading, 
    activeConversation, 
    messages, 
    newMessage, 
    loadingMessages, 
    setActiveConversation, 
    setNewMessage, 
    sendMessage,
    fetchConversations
  } = useMessages();
  
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUserId } = useSession();
  const [initializing, setInitializing] = useState(false);

  // Handle navigation state or URL parameter
  useEffect(() => {
    if (!currentUserId) return;
    
    const otherUserId = location.state?.otherUserId || userId;
    
    if (otherUserId && conversations.length > 0 && !initializing) {
      handleDirectMessage(otherUserId);
    }
  }, [userId, location.state, conversations, currentUserId, initializing]);

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
          .select('name, avatar_url')
          .eq('id', otherUserId)
          .single();
          
        const name = profileData?.name || "User";
        const avatar_url = profileData?.avatar_url || null;
        
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
            avatar_url
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

  const handleSendMessage = () => {
    if (activeConversation && activeConversation.otherParticipant && newMessage.trim()) {
      sendMessage(activeConversation.otherParticipant.id, newMessage);
    }
  };

  return (
    <>
      <Header />
      <main className="bg-[#f9f5ff] min-h-[calc(100vh-64px-80px)]">
        <div className="container mx-auto py-8 px-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 min-h-[600px]">
              {/* Conversation List */}
              <div className="md:col-span-1 border-r border-gray-200">
                <ConversationList 
                  conversations={conversations}
                  loading={loading}
                  activeConversationId={activeConversation?.id}
                  onSelectConversation={setActiveConversation}
                />
              </div>

              {/* Messages Area */}
              <div className="md:col-span-2 lg:col-span-3 flex flex-col">
                {activeConversation ? (
                  <>
                    <ConversationHeader 
                      name={activeConversation.otherParticipant?.name || "Unknown"}
                      avatar={activeConversation.otherParticipant?.avatar_url}
                      isOnline={Math.random() > 0.5} // Mocked online status for demo
                    />
                    
                    <MessageList 
                      messages={messages}
                      loading={loadingMessages}
                      currentUserId={currentUserId}
                      currentConversationId={activeConversation.id}
                      showNewConversationBanner={activeConversation.isTemporary}
                      isLoadingMessages={loadingMessages}
                    />
                    
                    <MessageInput 
                      value={newMessage}
                      onChange={setNewMessage}
                      onSend={handleSendMessage}
                    />
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-6">
                      <h3 className="text-lg font-medium text-gray-700">
                        Select a conversation to start chatting
                      </h3>
                      <p className="text-gray-500 mt-1">
                        Or search for someone new to message
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
