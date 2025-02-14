
import React, { useRef } from "react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { usePhotos } from "@/hooks/usePhotos";

interface PhotoGalleryProps {
  userId: string | null;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  userId
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { photos, uploadPhoto } = usePhotos(userId);

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadPhoto(file);
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[20px] p-6 shadow-lg w-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#6153BD]">Photos</h2>
        <Button
          onClick={handleAddPhoto}
          variant="ghost"
          className="text-[#6153BD] hover:text-[#6153BD]/80 hover:bg-[#6153BD]/10"
        >
          <Plus size={24} weight="bold" />
        </Button>
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
              className="w-full h-32 object-cover rounded-lg"
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No photos yet
        </div>
      )}
    </div>
  );
};
