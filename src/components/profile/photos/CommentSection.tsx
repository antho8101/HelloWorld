
import React from "react";
import { CommentForm } from "@/components/posts/CommentForm";
import { CommentList } from "@/components/posts/CommentList";
import { Comment } from "@/types/photo";

interface CommentSectionProps {
  comments: Comment[];
  newComment: string;
  onCommentChange: (value: string) => void;
  onCommentSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  newComment,
  onCommentChange,
  onCommentSubmit,
  isSubmitting,
}) => {
  return (
    <>
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <CommentList comments={comments} />
      </div>

      <CommentForm
        value={newComment}
        onChange={onCommentChange}
        onSubmit={onCommentSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
