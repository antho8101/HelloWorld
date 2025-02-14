
import React, { useRef } from 'react';
import { usePhotos } from '@/hooks/usePhotos';
import { toast } from 'sonner';

interface PhotoHandlerProps {
  userId: string | null;
  onPhotoUpload?: () => void;
}

export const PhotoHandler: React.FC<PhotoHandlerProps> = ({ userId, onPhotoUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto } = usePhotos(userId);

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadPhoto(file);
      onPhotoUpload?.();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileChange}
      accept="image/*"
      className="hidden"
    />
  );
};
