
import React from "react";

export const FriendsSection: React.FC = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[20px] p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-[#6153BD]">Friends</h3>
      <div className="text-gray-500 text-center">
        No friends yet
      </div>
    </div>
  );
};
