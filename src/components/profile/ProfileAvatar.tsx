
import React from "react";
import { WebcamDialog } from "./avatar/WebcamDialog";
import { CropDialog } from "./avatar/CropDialog";
import { AvatarDisplay } from "./avatar/AvatarDisplay";
import { AvatarUploadButtons } from "./avatar/AvatarUploadButtons";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";

interface ProfileAvatarProps {
  userId: string;
  username: string;
  avatarUrl: string;
  onAvatarChange: (url: string) => void;
}

export const ProfileAvatar = ({ userId, username, avatarUrl, onAvatarChange }: ProfileAvatarProps) => {
  const {
    fileInputRef,
    videoRef,
    imgRef,
    isWebcamOpen,
    setIsWebcamOpen,
    isCropOpen,
    setIsCropOpen,
    cropImage,
    crop,
    setCrop,
    takePhoto,
    handleFileUpload,
    handleCropSave,
    openWebcam,
    closeWebcam,
    cancelCrop
  } = useAvatarUpload(userId, onAvatarChange);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <AvatarDisplay avatarUrl={avatarUrl} username={username} />
        <AvatarUploadButtons 
          onUploadClick={() => fileInputRef.current?.click()} 
          onCameraClick={openWebcam}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      <WebcamDialog
        isOpen={isWebcamOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeWebcam();
          }
          setIsWebcamOpen(open);
        }}
        videoRef={videoRef}
        onTakePhoto={takePhoto}
        onClose={closeWebcam}
      />

      <CropDialog
        isOpen={isCropOpen}
        onOpenChange={setIsCropOpen}
        cropImage={cropImage}
        crop={crop}
        onCropChange={setCrop}
        imgRef={imgRef}
        onSave={handleCropSave}
        onCancel={cancelCrop}
      />
    </div>
  );
};
