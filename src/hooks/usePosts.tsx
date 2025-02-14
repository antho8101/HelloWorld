
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface Author {
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
}

interface PostComment {
  id: string;
  content: string;
  created_at: string;
  author: Author;
  likesCount: number;
  isLiked: boolean;
}

interface RawPost {
  id: string;
  content: string | null;
  created_at: string;
  user_id: string;
  likes_count: number;
  profiles: Profile;
}

interface Post extends Omit<RawPost, 'profiles'> {
  comments_count: number;
  profiles: Profile;
  isLiked: boolean;
  comments: PostComment[];
}

export const usePosts = (profileId: string | null, currentUserId: string | null) => {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    if (!profileId) return;

    try {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (
            id,
            name,
            username,
            avatar_url
          )
        `)
        .eq("user_id", profileId)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      if (!currentUserId || !postsData) return;

      const { data: likedPosts } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", currentUserId);

      const likedPostIds = new Set(likedPosts?.map(like => like.post_id) || []);

      const postsWithDetails = await Promise.all(
        postsData.map(async (post: RawPost) => {
          const { data: comments } = await supabase
            .from("comments")
            .select(`
              id,
              content,
              created_at,
              likes_count,
              profiles (
                name,
                username,
                avatar_url
              )
            `)
            .eq("post_id", post.id)
            .order("created_at", { ascending: true });

          const formattedComments: PostComment[] = (comments || []).map(comment => ({
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            author: {
              name: comment.profiles.name,
              username: comment.profiles.username,
              avatarUrl: comment.profiles.avatar_url,
            },
            likesCount: comment.likes_count,
            isLiked: false,
          }));

          return {
            ...post,
            comments_count: formattedComments.length,
            isLiked: likedPostIds.has(post.id),
            comments: formattedComments,
          };
        })
      );

      setPosts(postsWithDetails);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchPosts();
    }
  }, [profileId, currentUserId]);

  return { posts, fetchPosts };
};
