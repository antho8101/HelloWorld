
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle } from "@phosphor-icons/react";
import { format } from "date-fns";

interface PostHeaderProps {
  author: {
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  createdAt: string;
}

export const PostHeader: React.FC<PostHeaderProps> = ({ author, createdAt }) => {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={author.avatarUrl || undefined} />
        <AvatarFallback>
          <UserCircle size={24} weight="bold" className="text-[#6153BD]" />
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="font-semibold text-[#6153BD]">{author.name}</div>
        <div className="text-sm text-muted-foreground">
          @{author.username} • {format(new Date(createdAt), "MMM d, yyyy")}
        </div>
      </div>
    </div>
  );
};
