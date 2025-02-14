
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePhotoLikes = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const fetchLikes = async (photoUrl: string, userId: string) => {
    try {
      const [{ data: likeData }, { count }] = await Promise.all([
        supabase
          .from('photo_likes')
          .select('id')
          .eq('photo_url', photoUrl)
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('photo_likes')
          .select('*', { count: 'exact', head: true })
          .eq('photo_url', photoUrl)
      ]);

      setIsLiked(!!likeData);
      setLikesCount(count || 0);
    } catch (error) {
      console.error('Error fetching likes:', error);
      toast.error('Failed to load likes');
    }
  };

  const toggleLike = async (photoUrl: string, userId: string) => {
    try {
      if (isLiked) {
        const { error } = await supabase
          .from('photo_likes')
          .delete()
          .eq('photo_url', photoUrl)
          .eq('user_id', userId);

        if (error) throw error;
        setLikesCount(prev => prev - 1);
      } else {
        const { error } = await supabase
          .from('photo_likes')
          .insert({
            photo_url: photoUrl,
            user_id: userId
          });

        if (error) throw error;
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  return {
    isLiked,
    likesCount,
    fetchLikes,
    toggleLike
  };
};
