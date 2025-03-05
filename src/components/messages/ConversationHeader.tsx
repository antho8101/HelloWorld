
import React from "react";

interface ConversationHeaderProps {
  name: string;
  avatar: string | null;
  isOnline: boolean;
  age?: number | null;
  country?: string | null;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  name,
  avatar,
  isOnline,
  age,
  country
}) => {
  return (
    <div className="p-4 border-b border-gray-200 flex items-center">
      <div className="relative mr-3">
        <div className="w-10 h-10 bg-[#6153BD]/10 rounded-full flex items-center justify-center overflow-hidden">
          {avatar ? (
            <img 
              src={avatar} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[#6153BD] font-bold">
              {name ? name[0].toUpperCase() : "U"}
            </span>
          )}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{name}</h3>
          {age && <span className="text-sm text-gray-500">{age}</span>}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">
            {isOnline ? "Online" : "Offline"}
          </p>
          {country && (
            <>
              <span className="text-gray-300">•</span>
              <p className="text-sm text-gray-500">{country}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
