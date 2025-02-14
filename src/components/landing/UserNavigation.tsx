
import React from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle, ChatCircleDots, MagnifyingGlass, Gear } from "@phosphor-icons/react";

interface UserNavigationProps {
  userId: string | null;
  unreadMessages: number;
}

export const UserNavigation: React.FC<UserNavigationProps> = ({ userId, unreadMessages }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center gap-4 ml-8">
      <button 
        onClick={() => navigate(`/profile/${userId}`)}
        className="flex items-center gap-2 text-[#6153BD] hover:text-[#4B3FA0] transition-colors"
        title="My Profile"
      >
        <UserCircle size={24} weight="bold" />
        <span className="hidden md:inline">My Profile</span>
      </button>
      
      <button 
        onClick={() => navigate("/messages")}
        className="flex items-center gap-2 text-[#6153BD] hover:text-[#4B3FA0] transition-colors relative"
        title="Messages"
      >
        <ChatCircleDots size={24} weight="bold" />
        <span className="hidden md:inline">Messages</span>
        {unreadMessages > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#FF6A48] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            +{unreadMessages}
          </span>
        )}
      </button>
      
      <button 
        onClick={() => navigate("/search")}
        className="flex items-center gap-2 text-[#6153BD] hover:text-[#4B3FA0] transition-colors"
        title="Search"
      >
        <MagnifyingGlass size={24} weight="bold" />
        <span className="hidden md:inline">Search</span>
      </button>
      
      <button 
        onClick={() => navigate("/settings")}
        className="flex items-center gap-2 text-[#6153BD] hover:text-[#4B3FA0] transition-colors"
        title="Settings"
      >
        <Gear size={24} weight="bold" />
        <span className="hidden md:inline">Settings</span>
      </button>
    </div>
  );
};
