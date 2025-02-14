
import React, { useRef, useState } from "react";
import { Plus, ArrowLeft, ArrowRight, Heart, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePhotos } from "@/hooks/usePhotos";
import { useSession } from "@/hooks/useSession";
import { CommentForm } from "@/components/posts/CommentForm";
import { CommentList } from "@/components/posts/CommentList";
import { supabase } from "@/integrations/supabase/client";

interface PhotoGalleryProps {
  userId: string | null;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ userId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { photos, uploadPhoto } = usePhotos(userId);
  const { currentUserId } = useSession();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
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
    if (userId) {
      // Load comments for the selected photo
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          profiles:user_id (
            name,
            username,
            avatar_url
          )
        `)
        .eq('photo_url', photos[index])
        .order('created_at', { ascending: true });

      setComments(commentsData || []);

      // Check if the current user has liked this photo
      const { data: likeData } = await supabase
        .from('photo_likes')
        .select('id')
        .eq('photo_url', photos[index])
        .eq('user_id', currentUserId)
        .single();

      setIsLiked(!!likeData);

      // Get likes count
      const { count } = await supabase
        .from('photo_likes')
        .select('id', { count: 'exact' })
        .eq('photo_url', photos[index]);

      setLikesCount(count || 0);
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
          photo_url: photos[selectedPhotoIndex]
        })
        .select(`
          id,
          content,
          created_at,
          profiles:user_id (
            name,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setComments(prev => [...prev, data]);
      setNewComment("");
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!currentUserId || selectedPhotoIndex === null) return;

    try {
      if (isLiked) {
        await supabase
          .from('photo_likes')
          .delete()
          .eq('photo_url', photos[selectedPhotoIndex])
          .eq('user_id', currentUserId);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase
          .from('photo_likes')
          .insert({
            photo_url: photos[selectedPhotoIndex],
            user_id: currentUserId
          });
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[20px] p-6 shadow-lg w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#6153BD]">Photos</h2>
        {isOwnProfile && (
          <Button
            onClick={handleAddPhoto}
            variant="ghost"
            className="text-[#6153BD] hover:text-[#6153BD]/80 hover:bg-[#6153BD]/10"
          >
            <Plus size={24} weight="bold" />
          </Button>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handlePhotoClick(index)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No photos yet
        </div>
      )}

      <Dialog open={selectedPhotoIndex !== null} onOpenChange={() => setSelectedPhotoIndex(null)}>
        <DialogContent className="max-w-4xl w-11/12 p-0 bg-white rounded-lg">
          <div className="relative">
            <Button
              variant="ghost"
              className="absolute top-2 right-2 text-white hover:bg-black/20 z-10"
              onClick={() => setSelectedPhotoIndex(null)}
            >
              <X size={24} weight="bold" />
            </Button>
            
            <div className="grid grid-cols-[1fr,400px]">
              <div className="relative bg-black">
                {selectedPhotoIndex !== null && (
                  <img
                    src={photos[selectedPhotoIndex]}
                    alt={`Photo ${selectedPhotoIndex + 1}`}
                    className="w-full h-[600px] object-contain"
                  />
                )}
                
                <Button
                  variant="ghost"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/20"
                  onClick={handlePrevious}
                >
                  <ArrowLeft size={24} weight="bold" />
                </Button>
                
                <Button
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/20"
                  onClick={handleNext}
                >
                  <ArrowRight size={24} weight="bold" />
                </Button>
              </div>

              <div className="p-4 flex flex-col h-[600px]">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    onClick={handleLike}
                    className={`flex items-center gap-2 ${
                      isLiked ? 'text-red-500' : 'text-gray-600'
                    }`}
                  >
                    <Heart size={24} weight={isLiked ? "fill" : "regular"} />
                    {likesCount}
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  <CommentList comments={comments} />
                </div>

                <CommentForm
                  value={newComment}
                  onChange={setNewComment}
                  onSubmit={handleComment}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
