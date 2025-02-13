
import React from "react";
import { Circle } from "lucide-react";

interface UserProfileProps {
  image: string;
  name: string;
  age: number;
  location: string;
  isOnline?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  image,
  name,
  age,
  location,
  isOnline = false,
}) => {
  return (
    <div className="self-stretch w-[180px] my-auto max-md:w-[140px] group">
      <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-[10px] p-2">
        <img
          loading="lazy"
          srcSet={image}
          className="h-[200px] w-[180px] max-md:h-[160px] max-md:w-[140px] object-cover rounded-[10px] transition-transform duration-300"
          alt={`${name}, ${age}`}
        />
        <div className="w-full mt-2.5 px-1">
          <div className="text-xl max-md:text-lg font-bold flex items-center gap-2">
            <Circle
              size={12}
              fill={isOnline ? "#10b981" : "#ea384c"}
              stroke="none"
              className="transition-all duration-300 group-hover:scale-110"
            />
            <span className="transform transition-all duration-300 group-hover:text-[#6153BD]">
              {name}, {age}
            </span>
          </div>
          <div className="self-stretch w-full gap-2.5 text-base max-md:text-sm font-medium transition-all duration-300 group-hover:text-[#6153BD]">
            {location}
          </div>
        </div>
      </div>
    </div>
  );
};
