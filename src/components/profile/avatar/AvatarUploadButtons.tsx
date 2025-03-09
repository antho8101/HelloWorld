
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, UploadSimple } from "@phosphor-icons/react";

interface AvatarUploadButtonsProps {
  onUploadClick: () => void;
  onCameraClick: () => void;
}

export const AvatarUploadButtons = ({ onUploadClick, onCameraClick }: AvatarUploadButtonsProps) => {
  return (
    <div className="absolute bottom-2 right-2 flex gap-2">
      <Button
        size="icon"
        className="h-10 w-10 bg-[#6153BD] hover:bg-[#6153BD]/90 text-white border-2 border-[rgba(18,0,113,1)]"
        onClick={onUploadClick}
      >
        <UploadSimple size={20} weight="bold" />
      </Button>
      <Button
        size="icon"
        className="h-10 w-10 bg-[#6153BD] hover:bg-[#6153BD]/90 text-white border-2 border-[rgba(18,0,113,1)]"
        onClick={onCameraClick}
      >
        <Camera size={20} weight="bold" />
      </Button>
    </div>
  );
};
