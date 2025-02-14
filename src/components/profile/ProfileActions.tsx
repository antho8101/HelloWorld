
import React from "react";
import { Button } from "@/components/ui/button";
import { ChatText, UserPlus } from "@phosphor-icons/react";

interface ProfileActionsProps {
  onMessage: () => void;
  onAddFriend: () => void;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  onMessage,
  onAddFriend,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <Button 
        onClick={onMessage}
        className="bg-[rgba(97,83,189,1)] flex items-center gap-2.5 text-white justify-center px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[rgba(97,83,189,0.9)] w-full"
      >
        <ChatText size={20} weight="bold" />
        Send Message
      </Button>
      <Button 
        onClick={onAddFriend}
        className="bg-white gap-2.5 text-[#6153BD] whitespace-nowrap px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#6153BD] hover:text-white w-full"
      >
        <UserPlus size={20} weight="bold" />
        Add Friend
      </Button>
    </div>
  );
};
