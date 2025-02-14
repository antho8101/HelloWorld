
import React, { useRef, useState } from "react";
import { PhotoList } from "./photos/PhotoList";
import { PhotoViewer } from "./photos/PhotoViewer";
import { PhotoUploader } from "./photos/PhotoUploader";
import { usePhotos } from "@/hooks/usePhotos";
import { useSession } from "@/hooks/useSession";
import { usePhotoComments } from "@/hooks/usePhotoComments";
import { usePhotoLikes } from "@/hooks/usePhotoLikes";

interface PhotoGalleryProps {
  userId: string | null;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ userId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { photos, uploadPhoto } = usePhotos(userId);
  const { currentUserId } = useSession();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  
  const {
    comments,
    newComment,
    setNewComment,
    isSubmitting,
    fetchComments,
    addComment
  } = usePhotoComments(currentUserId);

  const {
    isLiked,
    likesCount,
    fetchLikes,
    toggleLike
  } = usePhotoLikes(currentUserId);
  
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
    if (photos[index]) {
      await Promise.all([
        fetchComments(photos[index]),
        fetchLikes(photos[index])
      ]);
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
    if (selectedPhotoIndex === null) return;
    await addComment(photos[selectedPhotoIndex]);
  };

  const handleLike = async () => {
    if (selectedPhotoIndex === null) return;
    await toggleLike(photos[selectedPhotoIndex]);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[20px] p-6 shadow-lg w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#6153BD]">Photos</h2>
        <PhotoUploader
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onAddPhoto={handleAddPhoto}
          isOwnProfile={isOwnProfile}
        />
      </div>
      
      <PhotoList
        photos={photos}
        isOwnProfile={isOwnProfile}
        onPhotoClick={handlePhotoClick}
        onAddPhoto={handleAddPhoto}
      />

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
    </div>
  );
};
