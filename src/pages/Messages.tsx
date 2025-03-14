
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessagePageContainer } from "@/components/messages/MessagePageContainer";
import { ActiveConversation } from "@/components/messages/ActiveConversation";
import { EmptyConversation } from "@/components/messages/EmptyConversation";
import { useMessages } from "@/hooks/useMessages";
import { useSession } from "@/hooks/useSession";
import { useDirectMessage } from "@/hooks/useDirectMessage";
import { toast } from "sonner";
import type { Conversation } from "@/types/messages";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const Messages = () => {
  const { 
    conversations, 
    loading, 
    activeConversation, 
    messages, 
    newMessage, 
    loadingMessages, 
    sending,
    messagesFetched,
    setActiveConversation, 
    setNewMessage, 
    sendMessage,
    fetchConversations,
    fetchMessages,
    messageError
  } = useMessages();
  
  const { userId, conversationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUserId, authLoading } = useSession();
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

  // Load initial data
  useEffect(() => {
    if (currentUserId) {
      console.log("Fetching initial conversations");
      fetchConversations();
    }
  }, [currentUserId, fetchConversations]);

  // Handle direct selection of conversation via URL
  useEffect(() => {
    if (conversationId && !initializing && conversations.length > 0) {
      console.log("Selecting conversation from URL param:", conversationId);
      const conversation = conversations.find(c => c.id === conversationId);
      
      if (conversation) {
        console.log("Found matching conversation in list, selecting it");
        setActiveConversation(conversation);
      } else {
        console.log("Conversation not found in list:", conversationId);
        toast.error("Conversation not found");
        navigate("/messages", { replace: true });
      }
    }
  }, [conversationId, conversations, initializing, setActiveConversation, navigate]);

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

  const handleSelectConversation = (conversation: Conversation) => {
    console.log("Selecting conversation:", conversation.id);
    setActiveConversation(conversation);
    
    // Update URL to reflect selected conversation
    if (conversation.id) {
      navigate(`/messages/${conversation.id}`, { replace: true });
    }
  };

  const handleRetry = () => {
    setHasError(false);
    fetchConversations();
  };

  const handleRetryMessages = () => {
    if (activeConversation?.id) {
      fetchMessages(activeConversation.id);
    }
  };

  // Show loading spinner while auth is initializing
  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <MessagePageContainer>
      {/* Conversation List */}
      <div className="md:col-span-1 border-r border-gray-200">
        <ConversationList 
          conversations={conversations}
          loading={loading}
          activeConversationId={activeConversation?.id}
          onSelectConversation={handleSelectConversation}
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
            messagesFetched={messagesFetched}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            sending={sending}
            error={messageError}
            handleRetryMessages={handleRetryMessages}
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
