
import React from "react";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { Conversation, Message } from "@/types/messages";

interface ActiveConversationProps {
  conversation: Conversation;
  messages: Message[];
  newMessage: string;
  currentUserId: string | null;
  loadingMessages: boolean;
  sending?: boolean;
  error?: boolean;
  messagesFetched?: boolean; // Add this prop
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleRetryMessages?: () => void;
}

export const ActiveConversation: React.FC<ActiveConversationProps> = ({
  conversation,
  messages,
  newMessage,
  currentUserId,
  loadingMessages,
  sending = false,
  error = false,
  messagesFetched = false, // Default to false
  setNewMessage,
  handleSendMessage,
  handleRetryMessages
}) => {
  return (
    <>
      <MessageList 
        messages={messages}
        loading={loadingMessages}
        currentUserId={currentUserId}
        currentConversationId={conversation.id}
        showNewConversationBanner={conversation.isTemporary}
        isLoadingMessages={loadingMessages}
        messagesFetched={messagesFetched}
        otherParticipant={conversation.otherParticipant}
        error={error}
        onRetry={handleRetryMessages}
      />
      
      <MessageInput 
        value={newMessage}
        onChange={setNewMessage}
        onSend={handleSendMessage}
        disabled={sending || error}
        isLoading={sending}
      />
    </>
  );
};
