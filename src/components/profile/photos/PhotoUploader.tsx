
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "@phosphor-icons/react";

interface PhotoUploaderProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddPhoto: () => void;
  isOwnProfile: boolean;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  fileInputRef,
  onFileChange,
  onAddPhoto,
  isOwnProfile,
}) => {
  if (!isOwnProfile) return null;

  return (
    <>
      <Button
        onClick={onAddPhoto}
        variant="ghost"
        className="text-[#6153BD] hover:text-[#6153BD]/80 hover:bg-[#6153BD]/10"
      >
        <Plus size={24} weight="bold" />
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />
    </>
  );
};
