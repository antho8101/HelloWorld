
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostHeader } from "./PostHeader";
import { PostActions } from "./PostActions";
import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";

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
    <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] space-y-4">
      <PostHeader author={author} createdAt={createdAt} />

      {content && (
        <p className="text-foreground">{content}</p>
      )}

      {imageUrl && (
        <img 
          src={imageUrl} 
          alt="Post" 
          loading="lazy"
          className="h-[200px] w-[180px] max-md:h-[160px] max-md:w-[140px] object-cover rounded-[10px] transition-transform duration-300"
        />
      )}

      <PostActions
        isLiked={isLiked}
        likesCount={localLikesCount}
        commentsCount={comments.length}
        onLike={handleLike}
        onCommentToggle={() => setShowComments(!showComments)}
      />

      {showComments && (
        <div className="space-y-4">
          <CommentList comments={comments} />
          <CommentForm
            value={newComment}
            onChange={setNewComment}
            onSubmit={handleComment}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </div>
  );
};
