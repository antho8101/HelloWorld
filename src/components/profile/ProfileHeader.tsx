
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
  return null;
};
