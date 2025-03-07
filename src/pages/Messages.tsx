
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessagePageContainer } from "@/components/messages/MessagePageContainer";
import { ActiveConversation } from "@/components/messages/ActiveConversation";
import { EmptyConversation } from "@/components/messages/EmptyConversation";
import { useMessages } from "@/hooks/useMessages";
import { useSession } from "@/hooks/useSession";
import { useDirectMessage } from "@/hooks/useDirectMessage";
import { toast } from "sonner";

export const Messages = () => {
  const { 
    conversations, 
    loading, 
    activeConversation, 
    messages, 
    newMessage, 
    loadingMessages, 
    sending,
    setActiveConversation, 
    setNewMessage, 
    sendMessage,
    fetchConversations
  } = useMessages();
  
  const { userId } = useParams();
  const location = useLocation();
  const { currentUserId } = useSession();
  const [hasError, setHasError] = useState(false);
  
  // Handle navigation state or URL parameter
  const otherUserId = location.state?.otherUserId || userId;
  
  // Use the direct message hook
  const { initializing, error } = useDirectMessage(
    otherUserId,
    currentUserId,
    conversations,
    setActiveConversation,
    fetchConversations
  );

  // Update error state based on hook error
  useEffect(() => {
    if (error) {
      setHasError(true);
    } else {
      setHasError(false);
    }
  }, [error]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') {
      toast.info("Please enter a message");
      return;
    }
    
    try {
      if (activeConversation) {
        const receiverId = activeConversation.otherParticipant?.id;
        if (!receiverId) {
          console.error("No recipient found for message");
          toast.error("No recipient found for message");
          return;
        }
        
        console.log("Sending message to:", receiverId, "Content:", newMessage);
        await sendMessage(receiverId, newMessage);
        console.log("Message sent successfully");
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setHasError(true);
      toast.error("Error sending message. Please try again.");
    }
  };

  const handleRetry = () => {
    setHasError(false);
    fetchConversations();
  };

  return (
    <MessagePageContainer>
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
          <ActiveConversation
            conversation={activeConversation}
            messages={messages}
            newMessage={newMessage}
            currentUserId={currentUserId}
            loadingMessages={loadingMessages}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            sending={sending}
          />
        ) : (
          <EmptyConversation 
            hasError={hasError} 
            onRetry={handleRetry} 
          />
        )}
      </div>
    </MessagePageContainer>
  );
};
