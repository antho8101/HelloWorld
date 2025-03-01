
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  DotsThree, 
  ChatCircle,
  Star,
  UserPlus,
  Trash,
  Prohibit,
  Flag
} from "@phosphor-icons/react";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import type { Conversation } from "@/types/messages";

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  setCurrentConversationId: (id: string) => void;
  setSelectedUserId: (id: string) => void;
  handleUserAction: (action: string, userId: string) => void;
  mockOnlineStatus: (userId: string) => boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentConversationId,
  setCurrentConversationId,
  setSelectedUserId,
  handleUserAction,
  mockOnlineStatus
}) => {
  return (
    <div className="w-[300px] border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>
      <ScrollArea className="h-[calc(100%-60px)]">
        <div className="p-2 space-y-2">
          {conversations.length > 0 ? (
            conversations.map((convo, i) => {
              const userId = convo.otherParticipant?.id || `user${i}`;
              const isOnline = mockOnlineStatus(userId);
              
              return (
                <div
                  key={convo.id}
                  className={`p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors relative ${
                    currentConversationId === convo.id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => {
                    setCurrentConversationId(convo.id);
                    setSelectedUserId(userId);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-[#6153BD]/10 rounded-full flex items-center justify-center">
                        {convo.otherParticipant?.avatar_url ? (
                          <img 
                            src={convo.otherParticipant.avatar_url} 
                            alt="Profile" 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <ChatCircle size={20} weight="fill" className="text-[#6153BD]" />
                        )}
                      </div>
                      <div 
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          isOnline ? 'bg-green-500' : 'bg-red-500'
                        }`} 
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{convo.otherParticipant?.name || `User ${i+1}`}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {convo.isTemporary ? "New conversation" : "Click to view messages"}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DotsThree size={20} weight="bold" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleUserAction('pin', userId)}>
                          <Star size={16} className="mr-2" /> Pin to favorites
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUserAction('add-friend', userId)}>
                          <UserPlus size={16} className="mr-2" /> Add friend
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUserAction('delete', userId)}>
                          <Trash size={16} className="mr-2" /> Delete conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUserAction('block', userId)}>
                          <Prohibit size={16} className="mr-2" /> Block user
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUserAction('report', userId)}>
                          <Flag size={16} className="mr-2" /> Report user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
