
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
        variant="ghost"
        size="sm"
        onClick={onLike}
        className={`flex items-center gap-2 ${isLiked ? "text-red-500" : ""}`}
      >
        <Heart weight={isLiked ? "fill" : "regular"} size={20} />
        {likesCount}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCommentToggle}
        className="flex items-center gap-2"
      >
        <ChatText size={20} />
        {commentsCount}
      </Button>
    </div>
  );
};
