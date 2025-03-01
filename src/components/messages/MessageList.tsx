
import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatCircle, Chats } from "@phosphor-icons/react";
import type { Message } from "@/types/messages";

interface MessageListProps {
  currentConversationId: string | null;
  currentMessages: Message[];
  isLoadingMessages: boolean;
  showNewConversationBanner: boolean;
  currentUserId: string | null;
}

export const MessageList: React.FC<MessageListProps> = ({
  currentConversationId,
  currentMessages,
  isLoadingMessages,
  showNewConversationBanner,
  currentUserId
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  return (
    <>
      {/* New Conversation Banner */}
      {currentConversationId && currentMessages.length === 0 && showNewConversationBanner && (
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
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {currentConversationId ? (
            isLoadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading messages...</p>
              </div>
            ) : currentMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500 max-w-md">
                  <ChatCircle size={64} weight="light" className="mx-auto mb-4 text-[#6153BD]" />
                  <h3 className="text-lg font-medium text-[#6153BD] mb-2">Start a new conversation</h3>
                  <p>Type your first message below to start chatting with this person.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Display actual messages */}
                {currentMessages.map((msg) => (
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
                {/* This div allows us to scroll to the bottom of the messages */}
                <div ref={messagesEndRef} />
              </>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <ChatCircle size={48} weight="light" className="mx-auto mb-2 text-gray-400" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );
};
