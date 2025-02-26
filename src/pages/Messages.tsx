
import React, { useState, KeyboardEvent } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatCircle } from "@phosphor-icons/react";

export const Messages = () => {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[rgba(255,243,240,1)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-200px)] flex">
            {/* Left Column - Conversations List */}
            <div className="w-[300px] border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Messages</h2>
              </div>
              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="p-2 space-y-2">
                  {/* Placeholder conversations */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#6153BD]/10 rounded-full flex items-center justify-center">
                          <ChatCircle size={20} weight="fill" className="text-[#6153BD]" />
                        </div>
                        <div>
                          <p className="font-medium">User {i}</p>
                          <p className="text-sm text-gray-500 truncate">
                            Last message preview...
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Right Column - Conversation */}
            <div className="flex-1 flex flex-col">
              {/* Conversation Header */}
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Chat with User 1</h2>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Sample messages */}
                  <div className="flex justify-end">
                    <div className="bg-[#6153BD] text-white rounded-lg p-3 max-w-[70%]">
                      Hello! How are you?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[70%]">
                      I'm doing great, thanks! How about you?
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-4">
                  <Input 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..." 
                    className="flex-1"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-[#6153BD] text-white rounded-lg hover:bg-[#6153BD]/90 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
