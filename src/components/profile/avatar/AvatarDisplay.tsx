
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@phosphor-icons/react";

interface AvatarDisplayProps {
  avatarUrl: string;
  username: string;
  size?: number;
}

export const AvatarDisplay = ({ avatarUrl, username, size = 64 }: AvatarDisplayProps) => {
  return (
    <Avatar className={`h-64 w-64 ring-4 ring-[#FECFC4]/20`}>
      <AvatarImage src={avatarUrl} alt={username} />
      <AvatarFallback className="bg-[#FECFC4] text-white text-4xl">
        <User size={48} weight="bold" />
      </AvatarFallback>
    </Avatar>
  );
};
