
import React from "react";

interface CommunityTitleProps {
  memberCount: number;
}

export const CommunityTitle: React.FC<CommunityTitleProps> = ({ memberCount }) => {
  return (
    <div className="self-center flex flex-col items-center gap-10 max-md:max-w-full">
      <h2 className="text-[#6153BD] text-5xl font-black max-md:max-w-full max-md:text-[40px]">
        Join a large community
      </h2>
      <p className="text-[#FF6A48] text-xl font-bold">
        Already {memberCount} active members!
      </p>
    </div>
  );
};
