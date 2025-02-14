
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin } from "@phosphor-icons/react";

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
    <div className="flex flex-col items-center pb-6 border-b border-gray-200">
      <Avatar className="h-32 w-32 mb-4">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback>
          <User className="w-12 h-12 text-gray-400" />
        </AvatarFallback>
      </Avatar>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#6153BD]">
          {name || "Anonymous"}
          {age && <span className="ml-2">{age}</span>}
        </h1>

        {username && (
          <p className="text-gray-600 mt-1">@{username}</p>
        )}

        {(city || country) && (
          <div className="flex items-center justify-center gap-1 mt-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>
              {[city, country].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
