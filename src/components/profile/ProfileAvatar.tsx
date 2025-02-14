
import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Camera, UploadSimple } from "@phosphor-icons/react";
import { useToast } from "@/hooks/use-toast";
import type { Crop } from 'react-image-crop';
import { WebcamDialog } from "./avatar/WebcamDialog";
import { CropDialog } from "./avatar/CropDialog";
import { uploadToSupabase, getCroppedImg } from "./avatar/imageUtils";

interface ProfileAvatarProps {
  userId: string;
  username: string;
  avatarUrl: string;
  onAvatarChange: (url: string) => void;
}

export const ProfileAvatar = ({ userId, username, avatarUrl, onAvatarChange }: ProfileAvatarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string>("");
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const { toast } = useToast();

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Webcam error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not access webcam",
      });
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const takePhoto = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    
    const blob = await new Promise<Blob>((resolve) => 
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg')
    );

    try {
      const publicUrl = await uploadToSupabase(blob, userId, 'jpg');
      onAvatarChange(publicUrl);
      setIsWebcamOpen(false);
      stopWebcam();
      resetFileInput();
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error uploading photo",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result as string);
      setIsCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async () => {
    try {
      if (!imgRef.current) return;
      const croppedBlob = await getCroppedImg(imgRef.current, crop);
      if (!croppedBlob) return;

      const publicUrl = await uploadToSupabase(croppedBlob, userId, 'jpg');
      onAvatarChange(publicUrl);
      setIsCropOpen(false);
      resetFileInput();
      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      });
    } catch (error) {
      console.error("Crop save error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error saving cropped image",
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Avatar className="h-64 w-64 ring-4 ring-[#FECFC4]/20">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback className="bg-[#FECFC4] text-white text-4xl">
            <User size={48} weight="bold" />
          </AvatarFallback>
        </Avatar>
        <div className="absolute bottom-2 right-2 flex gap-2">
          <Button
            size="icon"
            className="h-10 w-10 bg-[#6153BD] hover:bg-[#6153BD]/90 text-white border-2 border-[rgba(18,0,113,1)]"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadSimple size={20} weight="bold" />
          </Button>
          <Button
            size="icon"
            className="h-10 w-10 bg-[#6153BD] hover:bg-[#6153BD]/90 text-white border-2 border-[rgba(18,0,113,1)]"
            onClick={() => {
              setIsWebcamOpen(true);
              startWebcam();
            }}
          >
            <Camera size={20} weight="bold" />
          </Button>
        </div>
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
            stopWebcam();
          }
          setIsWebcamOpen(open);
        }}
        videoRef={videoRef}
        onTakePhoto={takePhoto}
        onClose={() => {
          setIsWebcamOpen(false);
          stopWebcam();
        }}
      />

      <CropDialog
        isOpen={isCropOpen}
        onOpenChange={setIsCropOpen}
        cropImage={cropImage}
        crop={crop}
        onCropChange={setCrop}
        imgRef={imgRef}
        onSave={handleCropSave}
        onCancel={() => {
          setIsCropOpen(false);
          resetFileInput();
        }}
      />
    </div>
  );
};
