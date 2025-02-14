
import React from "react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface PhotoListProps {
  photos: string[];
  isOwnProfile: boolean;
  onPhotoClick: (index: number) => void;
  onAddPhoto: () => void;
}

export const PhotoList: React.FC<PhotoListProps> = ({
  photos,
  isOwnProfile,
  onPhotoClick,
  onAddPhoto,
}) => {
  return (
    <>
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onPhotoClick(index)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No photos yet
        </div>
      )}
    </>
  );
};
