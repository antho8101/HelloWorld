
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
  isOnline?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  username,
  avatarUrl,
  age,
  city,
  country,
  isOnline = false,
}) => {
  return (
    <div className="flex flex-col items-center pb-6 w-fit">
      <div className="relative">
        <Avatar className="h-48 w-48 mb-4">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback>
            <User className="w-16 h-16 text-gray-400" />
          </AvatarFallback>
        </Avatar>
        <div 
          className={`absolute bottom-5 right-2 w-4 h-4 rounded-full border-2 border-white transition-colors duration-300 ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`} 
        />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#6153BD]">
          {name || "Anonymous"}
          {age && <span className="ml-0">, {age}</span>}
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
