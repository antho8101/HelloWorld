
import React from "react";
import { CommentForm } from "@/components/posts/CommentForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@phosphor-icons/react";
import { format } from "date-fns";
import { PhotoCommentView } from "@/types/photo";

interface CommentSectionProps {
  comments: PhotoCommentView[];
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
        {comments.map(comment => (
          <div key={comment.id} className="pl-4 border-l-2 border-border">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.avatarUrl || undefined} />
                <AvatarFallback>
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm">{comment.author.name}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(comment.createdAt), "MMM d, yyyy")}
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-foreground">{comment.content}</p>
          </div>
        ))}
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
