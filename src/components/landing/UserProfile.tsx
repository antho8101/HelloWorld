
import React from "react";
import { Circle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSession } from "@/hooks/useSession";

interface UserProfileProps {
  image: string;
  name: string;
  age: number;
  location: string;
  id?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  image,
  name,
  age,
  location,
  id,
}) => {
  const isOnline = useOnlineStatus(id || null);
  const navigate = useNavigate();
  const { currentUserId } = useSession();

  const handleProfileClick = () => {
    if (!currentUserId) {
      navigate("/signup");
      return;
    }
    if (id) {
      navigate(`/profile/${id}`);
    }
  };

  const Content = () => (
    <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-[10px] p-2">
      <img
        loading="lazy"
        srcSet={image}
        className="h-[200px] w-[180px] max-md:h-[160px] max-md:w-[140px] object-cover rounded-[10px] transition-transform duration-300"
        alt={`${name}, ${age}`}
      />
      <div className="w-full mt-2.5 px-1">
        <div className="text-xl max-md:text-lg font-bold flex items-center gap-2">
          <div className="relative">
            <Circle
              size={12}
              fill={isOnline ? "#10b981" : "#ea384c"}
              stroke="none"
              className="transition-all duration-300 group-hover:scale-110"
            />
            {isOnline && (
              <span className="absolute top-0 left-0 w-full h-full animate-ping rounded-full bg-green-500 opacity-75"></span>
            )}
          </div>
          <span className="transform transition-all duration-300 group-hover:text-[#6153BD]">
            {name}, {age}
          </span>
        </div>
        <div className="self-stretch w-full gap-2.5 text-base max-md:text-sm font-medium transition-all duration-300 group-hover:text-[#6153BD]">
          {location}
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className="self-stretch w-[180px] my-auto max-md:w-[140px] group cursor-pointer" 
      onClick={handleProfileClick}
    >
      <Content />
    </div>
  );
};
