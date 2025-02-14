
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface PostComment {
  id: string;
  content: string;
  created_at: string;
  author: {
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
  likesCount: number;
  isLiked: boolean;
}

interface Post {
  id: string;
  content: string | null;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  profiles: Profile;
  isLiked: boolean;
  comments: PostComment[];
}

interface RawComment {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  profiles: Profile;
}

export const usePosts = (profileId: string | null, currentUserId: string | null) => {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    if (profileId) {
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

      if (postsError) {
        console.error("Error fetching posts:", postsError);
        return;
      }

      if (currentUserId) {
        const { data: likedPosts } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", currentUserId);

        const likedPostIds = new Set(likedPosts?.map(like => like.post_id) || []);

        const postsWithLikes = await Promise.all(
          (postsData || []).map(async (post) => {
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

            const mappedComments = (comments || []).map((comment: RawComment) => ({
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

            const mappedPost: Post = {
              id: post.id,
              content: post.content,
              created_at: post.created_at,
              user_id: post.user_id,
              likes_count: post.likes_count,
              comments_count: mappedComments.length,
              profiles: post.profiles,
              isLiked: likedPostIds.has(post.id),
              comments: mappedComments,
            };

            return mappedPost;
          })
        );

        setPosts(postsWithLikes);
      }
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchPosts();
    }
  }, [profileId, currentUserId]);

  return { posts, fetchPosts };
};
