
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
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
}

export const ActiveConversation: React.FC<ActiveConversationProps> = ({
  conversation,
  messages,
  newMessage,
  currentUserId,
  loadingMessages,
  setNewMessage,
  handleSendMessage
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
        otherParticipant={conversation.otherParticipant}
      />
      
      <MessageInput 
        value={newMessage}
        onChange={setNewMessage}
        onSend={handleSendMessage}
      />
    </>
  );
};
