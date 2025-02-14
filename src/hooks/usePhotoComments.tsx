
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PhotoCommentView, mapPhotoCommentToComment } from '@/types/photo';
import { toast } from 'sonner';

export const usePhotoComments = () => {
  const [comments, setComments] = useState<PhotoCommentView[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async (photoId: string) => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          photo_id,
          profiles:user_id (
            name,
            username,
            avatar_url
          )
        `)
        .eq('photo_id', photoId);

      if (commentsError) throw commentsError;
      setComments((commentsData || []).map(mapPhotoCommentToComment));
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    }
  };

  const addComment = async (photoId: string, userId: string) => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          user_id: userId,
          photo_id: photoId
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          photo_id,
          profiles:user_id (
            name,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setComments(prev => [...prev, mapPhotoCommentToComment(data)]);
      setNewComment("");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    comments,
    newComment,
    setNewComment,
    isSubmitting,
    fetchComments,
    addComment
  };
};
