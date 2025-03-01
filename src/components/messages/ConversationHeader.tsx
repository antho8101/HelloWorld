
import React from "react";
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

interface ConversationHeaderProps {
  selectedUserId: string | null;
  currentConversationId: string | null;
  conversations: Conversation[];
  handleUserAction: (action: string, userId: string) => void;
  mockOnlineStatus: (userId: string) => boolean;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  selectedUserId,
  currentConversationId,
  conversations,
  handleUserAction,
  mockOnlineStatus
}) => {
  const currentConversation = conversations.find(c => c.id === currentConversationId);

  return (
    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <div className="w-8 h-8 bg-[#6153BD]/10 rounded-full flex items-center justify-center">
            <ChatCircle size={16} weight="fill" className="text-[#6153BD]" />
          </div>
          <div 
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
              selectedUserId && mockOnlineStatus(selectedUserId) ? 'bg-green-500' : 'bg-red-500'
            }`} 
          />
        </div>
        <h2 className="text-lg font-semibold">
          {selectedUserId ? 
            currentConversation?.otherParticipant?.name || "Chat" 
            : "Select a conversation"}
        </h2>
      </div>
      {selectedUserId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <DotsThree size={24} weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleUserAction('pin', selectedUserId)}>
              <Star size={16} className="mr-2" /> Pin to favorites
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUserAction('add-friend', selectedUserId)}>
              <UserPlus size={16} className="mr-2" /> Add friend
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUserAction('delete', selectedUserId)}>
              <Trash size={16} className="mr-2" /> Delete conversation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUserAction('block', selectedUserId)}>
              <Prohibit size={16} className="mr-2" /> Block user
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUserAction('report', selectedUserId)}>
              <Flag size={16} className="mr-2" /> Report user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
