
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Heart, ChatText } from "@phosphor-icons/react";
import { format } from "date-fns";
import { toast } from "sonner";

interface PostProps {
  id: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: string;
  likesCount: number;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  currentUserId: string;
  isLiked: boolean;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      name: string;
      username: string;
      avatarUrl: string | null;
    };
    likesCount: number;
    isLiked: boolean;
  }>;
}

export const Post: React.FC<PostProps> = ({
  id,
  content,
  imageUrl,
  createdAt,
  likesCount,
  author,
  currentUserId,
  isLiked: initialIsLiked,
  comments: initialComments,
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [localLikesCount, setLocalLikesCount] = useState(likesCount);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", id)
          .eq("user_id", currentUserId);
        setLocalLikesCount(prev => prev - 1);
      } else {
        await supabase
          .from("post_likes")
          .insert({ post_id: id, user_id: currentUserId });
        setLocalLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: id,
          user_id: currentUserId,
          content: newComment.trim(),
        })
        .select(`
          id,
          content,
          created_at,
          likes_count,
          profiles:user_id (
            name,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      const newCommentObj = {
        id: data.id,
        content: data.content,
        createdAt: data.created_at,
        author: {
          name: data.profiles.name,
          username: data.profiles.username,
          avatarUrl: data.profiles.avatar_url,
        },
        likesCount: 0,
        isLiked: false,
      };

      setComments(prev => [...prev, newCommentObj]);
      setNewComment("");
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md space-y-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={author.avatarUrl || undefined} />
          <AvatarFallback>
            <User size={24} />
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold">{author.name}</div>
          <div className="text-sm text-gray-500">
            @{author.username} • {format(new Date(createdAt), "MMM d, yyyy")}
          </div>
        </div>
      </div>

      {content && (
        <p className="text-gray-800">{content}</p>
      )}

      {imageUrl && (
        <img 
          src={imageUrl} 
          alt="Post" 
          className="rounded-lg max-h-96 w-full object-cover"
        />
      )}

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`flex items-center gap-2 ${isLiked ? "text-red-500" : ""}`}
        >
          <Heart weight={isLiked ? "fill" : "regular"} size={20} />
          {localLikesCount}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2"
        >
          <ChatText size={20} />
          {comments.length}
        </Button>
      </div>

      {showComments && (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="pl-4 border-l-2 border-gray-100">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.avatarUrl || undefined} />
                  <AvatarFallback>
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm">{comment.author.name}</div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(comment.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-800">{comment.content}</p>
            </div>
          ))}

          <form onSubmit={handleComment} className="space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none"
            />
            <Button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="bg-[#6153BD] hover:bg-[#6153BD]/90"
            >
              Post Comment
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
