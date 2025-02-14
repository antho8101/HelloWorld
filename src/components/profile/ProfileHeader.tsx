
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
      <h2 className="text-2xl font-black text-[#6153BD] mb-8 text-center">Create a Profile</h2>
    </>
  );
};
