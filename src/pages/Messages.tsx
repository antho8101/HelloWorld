
import React, { useEffect } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/landing/Header";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { ConversationHeader } from "@/components/messages/ConversationHeader";
import { useMessages } from "@/hooks/useMessages";
import { useSession } from "@/hooks/useSession";
import { useParams, useNavigate } from "react-router-dom";

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
  } = useMessages();
  
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUserId } = useSession();

  // Handle direct message from URL parameter
  useEffect(() => {
    if (userId && conversations.length > 0) {
      // Find existing conversation with this user
      const existingConversation = conversations.find(c => 
        c.otherParticipant && c.otherParticipant.id === userId
      );
      
      if (existingConversation) {
        setActiveConversation(existingConversation);
      } else {
        // Create placeholder for new conversation
        const newConversationPlaceholder = {
          id: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_pinned: false,
          is_archived: false,
          otherParticipant: {
            id: userId,
            name: "New Conversation",
            avatar_url: null
          },
          isTemporary: true
        };
        setActiveConversation(newConversationPlaceholder);
      }
      
      // Clear URL parameter after handling
      navigate("/messages", { replace: true });
    }
  }, [userId, conversations, navigate, setActiveConversation]);

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
