
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "@phosphor-icons/react";

interface UserProfileProps {
  id: string;
  name: string;
  languages: string[];
  avatar?: string;
  onClick?: (id: string) => void;
}

export const UserProfile = ({ id, name, languages, avatar, onClick }: UserProfileProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <div 
      className="bg-white/80 backdrop-blur-sm p-6 rounded-[20px] flex flex-col items-center space-y-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatar} />
        <AvatarFallback className="bg-[#FECFC4]">
          <User size={32} weight="bold" />
        </AvatarFallback>
      </Avatar>
      <h3 className="text-xl font-semibold text-[#6153BD]">{name}</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {languages.map((language) => (
          <Badge key={language} variant="secondary">
            {language}
          </Badge>
        ))}
      </div>
    </div>
  );
};
