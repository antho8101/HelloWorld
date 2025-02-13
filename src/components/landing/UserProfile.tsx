
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
    <div className="self-stretch w-[150px] my-auto">
      <img
        loading="lazy"
        srcSet={image}
        className="h-[200px] w-[150px] object-cover rounded-[10px]"
        alt={`${name}, ${age}`}
      />
      <div className="w-full mt-2.5">
        <div className="text-xl font-bold flex items-center gap-2">
          <Circle
            size={12}
            fill={isOnline ? "#10b981" : "#ea384c"}
            stroke="none"
          />
          {name}, {age}
        </div>
        <div className="self-stretch w-full gap-2.5 text-base font-medium">
          {location}
        </div>
      </div>
    </div>
  );
};
