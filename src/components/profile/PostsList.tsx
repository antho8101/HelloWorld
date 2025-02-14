
import React from "react";
import { Post } from "@/components/posts/Post";
import { CreatePost } from "@/components/posts/CreatePost";

interface PostsListProps {
  posts: any[];
  currentUserId: string | null;
  profileId: string | null;
  onPostCreated: () => void;
}

export const PostsList: React.FC<PostsListProps> = ({ posts, currentUserId, profileId, onPostCreated }) => {
  const isOwnProfile = currentUserId === profileId;

  return (
    <div className="space-y-8">
      {isOwnProfile && (
        <CreatePost userId={currentUserId} onPostCreated={onPostCreated} />
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <Post
            key={post.id}
            id={post.id}
            content={post.content}
            imageUrl={post.image_url}
            createdAt={post.created_at}
            likesCount={post.likes_count}
            author={{
              id: post.profiles.id,
              name: post.profiles.name,
              username: post.profiles.username,
              avatarUrl: post.profiles.avatar_url,
            }}
            currentUserId={currentUserId || ""}
            isLiked={post.isLiked}
            comments={post.comments}
          />
        ))}
      </div>
    </div>
  );
};
