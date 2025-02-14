
import React from "react";
import { Heart } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface LikeButtonProps {
  isLiked: boolean;
  likesCount: number;
  onClick: () => void;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  likesCount,
  onClick,
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Button
        variant="ghost"
        onClick={onClick}
        className={`flex items-center gap-2 ${
          isLiked ? 'text-red-500' : 'text-gray-600'
        }`}
      >
        <Heart size={24} weight={isLiked ? "fill" : "regular"} />
        {likesCount}
      </Button>
    </div>
  );
};
