
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, ChatText } from "@phosphor-icons/react";

interface PostActionsProps {
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  onLike: () => void;
  onCommentToggle: () => void;
}

export const PostActions: React.FC<PostActionsProps> = ({
  isLiked,
  likesCount,
  commentsCount,
  onLike,
  onCommentToggle,
}) => {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onLike}
        className={`bg-white gap-2.5 text-[#6153BD] whitespace-nowrap px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#6153BD] hover:text-white ${
          isLiked ? "bg-[#6153BD] text-white" : ""
        }`}
      >
        <Heart weight={isLiked ? "fill" : "regular"} size={20} />
        {likesCount}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onCommentToggle}
        className="bg-white gap-2.5 text-[#6153BD] whitespace-nowrap px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#6153BD] hover:text-white"
      >
        <ChatText size={20} />
        {commentsCount}
      </Button>
    </div>
  );
};
