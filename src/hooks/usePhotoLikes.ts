
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePhotoLikes = (currentUserId: string | null) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const fetchLikes = async (photoUrl: string) => {
    if (!currentUserId) return;

    try {
      const { data: likeData, error: likeError } = await supabase
        .from('photo_likes')
        .select('id')
        .eq('photo_url', photoUrl)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (likeError) throw likeError;
      setIsLiked(!!likeData);

      const { count, error: countError } = await supabase
        .from('photo_likes')
        .select('*', { count: 'exact', head: true })
        .eq('photo_url', photoUrl);

      if (countError) throw countError;
      setLikesCount(count || 0);
    } catch (error) {
      console.error('Error loading likes:', error);
      toast.error('Failed to load likes');
    }
  };

  const toggleLike = async (photoUrl: string) => {
    if (!currentUserId) return;

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('photo_likes')
          .delete()
          .eq('photo_url', photoUrl)
          .eq('user_id', currentUserId);

        if (error) throw error;
        setLikesCount(prev => prev - 1);
      } else {
        const { error } = await supabase
          .from('photo_likes')
          .insert({
            photo_url: photoUrl,
            user_id: currentUserId
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
