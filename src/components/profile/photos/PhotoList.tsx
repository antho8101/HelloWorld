
import React from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface PhotoListProps {
  photos: string[];
  isOwnProfile: boolean;
  onPhotoClick: (index: number) => void;
  onAddPhoto: () => void;
  onDeletePhoto?: (photoUrl: string) => void;
}

export const PhotoList: React.FC<PhotoListProps> = ({
  photos,
  isOwnProfile,
  onPhotoClick,
  onAddPhoto,
  onDeletePhoto,
}) => {
  return (
    <>
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onPhotoClick(index)}
              />
              {isOwnProfile && onDeletePhoto && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePhoto(photo);
                  }}
                >
                  <Trash size={16} weight="bold" />
                </Button>
              )}
            </div>
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
