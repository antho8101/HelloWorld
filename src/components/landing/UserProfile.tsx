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
        className="aspect-[0.75] object-contain w-[150px] max-w-full rounded-[10px]"
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
