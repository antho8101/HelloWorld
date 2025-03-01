
import React from "react";

interface ConversationHeaderProps {
  name: string | null;
  avatar: string | null;
  isOnline: boolean;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  name,
  avatar,
  isOnline
}) => {
  return (
    <div className="p-4 border-b border-gray-200 flex items-center">
      <div className="relative mr-3">
        <div className="w-10 h-10 bg-[#6153BD]/10 rounded-full flex items-center justify-center overflow-hidden">
          {avatar ? (
            <img src={avatar} alt={name || "User"} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#6153BD] font-bold">{name ? name[0].toUpperCase() : "U"}</span>
          )}
        </div>
        <div 
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`} 
        />
      </div>
      <div>
        <h2 className="font-medium">{name || "User"}</h2>
        <p className="text-xs text-gray-500">{isOnline ? "Online" : "Offline"}</p>
      </div>
    </div>
  );
};
