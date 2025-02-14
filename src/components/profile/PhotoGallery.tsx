
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePhotos } from "@/hooks/usePhotos";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { PhotoList } from "./photos/PhotoList";
import { PhotoViewer } from "./photos/PhotoViewer";
import { PhotoHandler } from "./photos/PhotoHandler";
import { usePhotoComments } from "@/hooks/usePhotoComments";
import { usePhotoLikes } from "@/hooks/usePhotoLikes";

interface PhotoGalleryProps {
  userId: string | null;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ userId }) => {
  const { photos, loading, fetchPhotos } = usePhotos(userId);
  const { currentUserId } = useSession();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const { comments, newComment, setNewComment, isSubmitting, fetchComments, addComment } = usePhotoComments();
  const { isLiked, likesCount, fetchLikes, toggleLike } = usePhotoLikes();
  
  const isOwnProfile = currentUserId === userId;

  const handlePhotoClick = async (index: number) => {
    setSelectedPhotoIndex(index);
    if (userId && currentUserId) {
      try {
        const { data: photoData, error: photoError } = await supabase
          .from('photos')
          .select('id')
          .eq('photo_url', photos[index])
          .single();

        if (photoError) throw photoError;

        await Promise.all([
          fetchComments(photoData.id),
          fetchLikes(photos[index], currentUserId)
        ]);
      } catch (error) {
        console.error('Error loading photo data:', error);
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
    if (!currentUserId || selectedPhotoIndex === null) return;

    try {
      const { data: photoData, error: photoError } = await supabase
        .from('photos')
        .select('id')
        .eq('photo_url', photos[selectedPhotoIndex])
        .single();

      if (photoError) throw photoError;
      await addComment(photoData.id, currentUserId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLike = async () => {
    if (!currentUserId || selectedPhotoIndex === null) return;
    await toggleLike(photos[selectedPhotoIndex], currentUserId);
  };

  const triggerFileInput = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[20px] p-6 shadow-lg w-full">
      <PhotoHandler userId={userId} onPhotoUpload={fetchPhotos} />
      
      <PhotoList
        photos={photos}
        isOwnProfile={isOwnProfile}
        onPhotoClick={handlePhotoClick}
        onAddPhoto={triggerFileInput}
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
