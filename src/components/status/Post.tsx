
import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Loader2, Send } from "lucide-react";
import type { PostType } from "./PostFeed";

interface PostProps {
  post: PostType;
  onUpdate: () => void;
}

export const Post = ({ post, onUpdate }: PostProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const isLiked = post.post_likes.some(like => session?.user?.id === like.user_id);

  const handleLike = async () => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please sign in to like posts",
      });
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', session.user.id);
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: session.user.id
          });
      }
      onUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleComment = async () => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please sign in to comment",
      });
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await supabase
        .from('post_comments')
        .insert({
          post_id: post.id,
          content: newComment.trim(),
          user_id: session.user.id
        });

      setNewComment("");
      onUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-start space-x-4 mb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.profiles.avatar_url || ""} alt={post.profiles.username} />
          <AvatarFallback>{post.profiles.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-bold">{post.profiles.username}</p>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {post.content && (
        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
      )}

      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post"
          className="rounded-lg mb-4 max-h-[500px] object-cover w-full"
        />
      )}

      <div className="flex items-center space-x-6 text-gray-500">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 ${isLiked ? "text-red-500" : ""}`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
          <span>{post.post_likes.length}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{post.post_comments.length}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4">
          <div className="flex space-x-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleComment}
              disabled={loading || !newComment.trim()}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {post.post_comments
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles.avatar_url || ""} alt={comment.profiles.username} />
                    <AvatarFallback>{comment.profiles.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold">{comment.profiles.username}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
