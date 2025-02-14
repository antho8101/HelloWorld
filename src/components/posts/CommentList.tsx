
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@phosphor-icons/react";
import { format } from "date-fns";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
    username: string;
    avatarUrl: string | null;
  };
}

interface CommentListProps {
  comments: Comment[];
}

export const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  return (
    <>
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
    </>
  );
};
