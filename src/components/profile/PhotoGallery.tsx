
import React, { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePhotos } from "@/hooks/usePhotos";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PhotoList } from "./photos/PhotoList";
import { PhotoViewer } from "./photos/PhotoViewer";
import { PhotoComment, Comment, mapPhotoCommentToComment } from "@/types/photo";

interface PhotoGalleryProps {
  userId: string | null;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ userId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { photos, uploadPhoto } = usePhotos(userId);
  const { currentUserId } = useSession();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  
  const isOwnProfile = currentUserId === userId;

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadPhoto(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoClick = async (index: number) => {
    setSelectedPhotoIndex(index);
    if (userId && currentUserId) {
      try {
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            created_at,
            user_id,
            post_id,
            profiles:user_id (
              name,
              username,
              avatar_url
            )
          `)
          .eq('post_id', photos[index]);

        if (commentsError) throw commentsError;
        setComments((commentsData || []).map(mapPhotoCommentToComment));

        const { data: likeData, error: likeError } = await supabase
          .from('photo_likes')
          .select('id')
          .eq('photo_url', photos[index])
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (likeError) throw likeError;
        setIsLiked(!!likeData);

        const { count, error: countError } = await supabase
          .from('photo_likes')
          .select('*', { count: 'exact', head: true })
          .eq('photo_url', photos[index]);

        if (countError) throw countError;
        setLikesCount(count || 0);
      } catch (error) {
        console.error('Error loading photo data:', error);
        toast.error('Failed to load photo data');
      }
    }
  };

  const handlePrevious = () => {
    if (selectedPhotoIndex === null) return;
    const newIndex = selectedPhotoIndex === 0 ? photos.length - 1 : selectedPhotoIndex - 1;
    handlePhotoClick(newIndex);
  };

  const handleNext = () => {
    if (selectedPhotoIndex === null) return;
    const newIndex = selectedPhotoIndex === photos.length - 1 ? 0 : selectedPhotoIndex + 1;
    handlePhotoClick(newIndex);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId || selectedPhotoIndex === null) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          user_id: currentUserId,
          post_id: photos[selectedPhotoIndex]
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          post_id,
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

  const handleLike = async () => {
    if (!currentUserId || selectedPhotoIndex === null) return;

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('photo_likes')
          .delete()
          .eq('photo_url', photos[selectedPhotoIndex])
          .eq('user_id', currentUserId);

        if (error) throw error;
        setLikesCount(prev => prev - 1);
      } else {
        const { error } = await supabase
          .from('photo_likes')
          .insert({
            photo_url: photos[selectedPhotoIndex],
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

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[20px] p-6 shadow-lg w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <PhotoList
        photos={photos}
        isOwnProfile={isOwnProfile}
        onPhotoClick={handlePhotoClick}
        onAddPhoto={handleAddPhoto}
      />

      <Dialog open={selectedPhotoIndex !== null} onOpenChange={() => setSelectedPhotoIndex(null)}>
        <DialogContent className="max-w-4xl w-11/12 p-0 bg-white rounded-lg">
          {selectedPhotoIndex !== null && (
            <PhotoViewer
              photoUrl={photos[selectedPhotoIndex]}
              photoIndex={selectedPhotoIndex}
              onClose={() => setSelectedPhotoIndex(null)}
              onPrevious={handlePrevious}
              onNext={handleNext}
              isLiked={isLiked}
              likesCount={likesCount}
              onLike={handleLike}
              comments={comments}
              newComment={newComment}
              onCommentChange={setNewComment}
              onCommentSubmit={handleComment}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
