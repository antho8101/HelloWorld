
import React from "react";

interface UserProfileProps {
  image: string;
  name: string;
  age: number;
  location: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  image,
  name,
  age,
  location,
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
        <div className="text-xl font-bold">
          {name}, {age}
        </div>
        <div className="self-stretch w-full gap-2.5 text-base font-medium">
          {location}
        </div>
      </div>
    </div>
  );
};
