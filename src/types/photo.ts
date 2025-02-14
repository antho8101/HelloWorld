
export interface PhotoComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  photo_id: string;
  profiles: {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export interface PhotoCommentView {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
    username: string;
    avatarUrl: string | null;
  };
}

export const mapPhotoCommentToComment = (photoComment: PhotoComment): PhotoCommentView => ({
  id: photoComment.id,
  content: photoComment.content,
  createdAt: photoComment.created_at,
  author: {
    name: photoComment.profiles.name || "Anonymous",
    username: photoComment.profiles.username || "anonymous",
    avatarUrl: photoComment.profiles.avatar_url,
  },
});
