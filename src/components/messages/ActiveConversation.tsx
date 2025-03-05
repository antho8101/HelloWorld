
import React from "react";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { ConversationHeader } from "@/components/messages/ConversationHeader";
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
      <ConversationHeader 
        name={conversation.otherParticipant?.name || "Unknown"}
        avatar={conversation.otherParticipant?.avatar_url}
        isOnline={conversation.otherParticipant?.is_online || false}
        age={conversation.otherParticipant?.age}
        country={conversation.otherParticipant?.country}
      />
      
      <MessageList 
        messages={messages}
        loading={loadingMessages}
        currentUserId={currentUserId}
        currentConversationId={conversation.id}
        showNewConversationBanner={conversation.isTemporary}
        isLoadingMessages={loadingMessages}
      />
      
      <MessageInput 
        value={newMessage}
        onChange={setNewMessage}
        onSend={handleSendMessage}
      />
    </>
  );
};
