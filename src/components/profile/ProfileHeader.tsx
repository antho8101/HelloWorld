
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@phosphor-icons/react";

interface ProfileHeaderProps {
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  age: number | null;
  city: string | null;
  country: string | null;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  username,
  avatarUrl,
  age,
  city,
  country,
}) => {
  return (
    <>
      <Avatar className="h-32 w-32 ring-4 ring-[#FECFC4]/20">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className="bg-[#FECFC4]">
          <User size={48} weight="bold" />
        </AvatarFallback>
      </Avatar>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-[#6153BD]">
          {name || username}
          {age && <span className="ml-2">{age}</span>}
        </h1>
        {username && name && (
          <p className="text-xl text-gray-600">@{username}</p>
        )}
        {(city || country) && (
          <p className="text-lg text-gray-600">
            {[city, country].filter(Boolean).join(", ")}
          </p>
        )}
      </div>
    </>
  );
};
