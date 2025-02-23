
import React from "react";
import { useSession } from "@/hooks/useSession";
import { useConversations } from "@/hooks/useConversations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Star,
  DotsThree,
  Flag,
  Archive,
  User,
} from "@phosphor-icons/react";
import { format } from "date-fns";

export const Messages: React.FC = () => {
  const { currentUserId } = useSession();
  const { conversations, loading, togglePin, archiveConversation, reportConversation } = useConversations(currentUserId);

  if (!currentUserId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          Please log in to access your messages.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="col-span-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold text-[#6153BD]">Messages</h2>
          </div>
          
          <div className="divide-y">
            {loading ? (
              <div className="p-4 text-center">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherParticipant = conversation.participants.find(
                  (p) => p.id !== currentUserId
                );

                return (
                  <div
                    key={conversation.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={otherParticipant?.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">
                            {otherParticipant?.name || "Unknown"}
                          </h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePin(conversation.id);
                              }}
                              className={`text-gray-400 hover:text-yellow-400 transition-colors ${
                                conversation.is_pinned ? "text-yellow-400" : ""
                              }`}
                            >
                              <Star weight={conversation.is_pinned ? "fill" : "regular"} className="w-5 h-5" />
                            </button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <DotsThree className="w-5 h-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => archiveConversation(conversation.id)}
                                >
                                  <Archive className="w-4 h-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => reportConversation(conversation.id)}
                                  className="text-red-600"
                                >
                                  <Flag className="w-4 h-4 mr-2" />
                                  Report
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {conversation.last_message && (
                          <div className="mt-1">
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.last_message.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {format(
                                new Date(conversation.last_message.created_at),
                                "MMM d, h:mm a"
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area - à implémenter dans la prochaine étape */}
        <div className="col-span-2 bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start messaging
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
