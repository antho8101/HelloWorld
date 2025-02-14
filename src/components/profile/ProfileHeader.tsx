
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, ArrowLeft } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <img
          loading="lazy"
          srcSet="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/fc1f6b1b3fc6ee87b690f1b6be44876cdf1e0e313d0c5d6607e5e53302011af2?placeholderIfAbsent=true&width=100 100w, https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/fc1f6b1b3fc6ee87b690f1b6be44876cdf1e0e313d0c5d6607e5e53302011af2?placeholderIfAbsent=true&width=200 200w"
          className="aspect-[1] object-contain w-[76px]"
          alt="HelloWorld! Logo"
        />
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#6153BD] font-bold hover:text-[#6153BD]/90 transition-colors"
        >
          <ArrowLeft size={20} weight="bold" />
          Back to Homepage
        </button>
      </div>
      <h2 className="text-2xl font-black text-[#6153BD] mb-8 text-center">Create a Profile</h2>
    </div>
  );
};
