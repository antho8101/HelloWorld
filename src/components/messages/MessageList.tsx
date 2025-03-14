
import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatCircle, Chats, WarningCircle } from "@phosphor-icons/react";
import type { Message, ConversationParticipant } from "@/types/messages";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUserId: string | null;
  currentConversationId?: string | null;
  showNewConversationBanner?: boolean;
  isLoadingMessages?: boolean;
  messagesFetched?: boolean;
  otherParticipant?: ConversationParticipant | null;
  error?: boolean;
  onRetry?: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  currentUserId,
  currentConversationId,
  showNewConversationBanner = false,
  isLoadingMessages = false,
  messagesFetched = false,
  otherParticipant,
  error = false,
  onRetry
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log("MessageList rendered with:", {
      messagesCount: messages.length,
      loading: isLoadingMessages,
      currentUserId,
      currentConversationId,
      messagesFetched,
      error
    });
    
    if (messages.length > 0) {
      console.log("First message:", messages[0]);
      console.log("Last message:", messages[messages.length - 1]);
    }
  }, [messages, isLoadingMessages, currentUserId, currentConversationId, messagesFetched, error]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current && !isLoadingMessages) {
      console.log("Scrolling to bottom of message list");
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoadingMessages]);

  return (
    <>
      {/* New Conversation Banner */}
      {currentConversationId && messages.length === 0 && messagesFetched && !isLoadingMessages && !error && showNewConversationBanner && (
        <div className="bg-blue-50 p-4 border-b border-blue-100">
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Chats size={20} weight="fill" />
            <p className="text-center font-medium">
              This is the beginning of your conversation. Send a message to start chatting.
            </p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4 min-h-full">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 py-8">
              <WarningCircle size={40} weight="duotone" className="text-red-500 mb-2" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Could not load messages</h3>
              <p className="text-gray-500 text-center mb-4">
                There was a problem loading your conversation messages.
              </p>
              {onRetry && (
                <button 
                  onClick={onRetry}
                  className="px-4 py-2 bg-[#6153BD] text-white rounded-md hover:bg-[#4f44a3] transition-colors"
                >
                  Try again
                </button>
              )}
            </div>
          ) : currentConversationId && messagesFetched && messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500 max-w-md">
                <ChatCircle size={64} weight="light" className="mx-auto mb-4 text-[#6153BD]" />
                <h3 className="text-lg font-medium text-[#6153BD] mb-2">Start a new conversation</h3>
                <p>Type your first message below to start chatting with this person.</p>
              </div>
            </div>
          ) : !currentConversationId ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <ChatCircle size={48} weight="light" className="mx-auto mb-2 text-gray-400" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Display actual messages */}
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`p-3 rounded-lg max-w-[70%] ${
                      msg.sender_id === currentUserId 
                        ? 'bg-[#6153BD] text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {/* Element for scrolling to bottom */}
              <div ref={messagesEndRef} className="h-1" />
            </>
          )}
        </div>
      </ScrollArea>
    </>
  );
};
