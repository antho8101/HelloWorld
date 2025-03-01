
import React, { useState, KeyboardEvent, useEffect } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/layout/Footer";
import { ConversationList } from "@/components/messages/ConversationList";
import { ConversationHeader } from "@/components/messages/ConversationHeader";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { useMessages } from "@/hooks/useMessages";
import { useProfile } from "@/hooks/useProfile";

export const Messages = () => {
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  
  const {
    selectedUserId,
    setSelectedUserId,
    conversations,
    currentConversationId,
    setCurrentConversationId,
    currentMessages,
    showNewConversationBanner,
    isLoadingMessages,
    mockOnlineStatus,
    sendMessage,
    currentUserId
  } = useMessages();

  const { profile } = useProfile(selectedUserId);

  useEffect(() => {
    if (selectedUserId) {
      fetchPosts();
    }
  }, [selectedUserId]);

  const fetchPosts = async () => {
    // This is kept as a placeholder since it's not directly used in the UI
    // but might be used in future features
    console.log("Would fetch posts for user:", selectedUserId);
  };

  const handleSendMessage = () => {
    if (sendMessage(message)) {
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFormatClick = (format: string) => {
    console.log("Applying format:", format);
    // Format implementation will go here
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Image selected:", file);
      // Image upload implementation will go here
    }
  };

  const handleUserAction = (action: string, userId: string) => {
    console.log(`Performing action: ${action} on user: ${userId}`);
    // Implementation for user actions will go here
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[rgba(255,243,240,1)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-200px)] flex">
            {/* Left Column - Conversations List */}
            <ConversationList 
              conversations={conversations}
              currentConversationId={currentConversationId}
              setCurrentConversationId={setCurrentConversationId}
              setSelectedUserId={setSelectedUserId}
              handleUserAction={handleUserAction}
              mockOnlineStatus={mockOnlineStatus}
            />

            {/* Right Column - Conversation */}
            <div className="flex-1 flex flex-col">
              {/* Conversation Header */}
              <ConversationHeader 
                selectedUserId={selectedUserId}
                currentConversationId={currentConversationId}
                conversations={conversations}
                handleUserAction={handleUserAction}
                mockOnlineStatus={mockOnlineStatus}
              />

              {/* Messages Area */}
              <MessageList 
                currentConversationId={currentConversationId}
                currentMessages={currentMessages}
                isLoadingMessages={isLoadingMessages}
                showNewConversationBanner={showNewConversationBanner}
                currentUserId={currentUserId}
              />

              {/* Message Input */}
              {currentConversationId && (
                <MessageInput 
                  message={message}
                  setMessage={setMessage}
                  handleSendMessage={handleSendMessage}
                  handleFormatClick={handleFormatClick}
                  handleImageUpload={handleImageUpload}
                  handleKeyPress={handleKeyPress}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
