
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Crop } from 'react-image-crop';
import { uploadToSupabase, getCroppedImg } from "@/components/profile/avatar/imageUtils";

export const useAvatarUpload = (userId: string, onAvatarChange: (url: string) => void) => {
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

  const openWebcam = () => {
    setIsWebcamOpen(true);
    startWebcam();
  };

  const closeWebcam = () => {
    setIsWebcamOpen(false);
    stopWebcam();
  };

  const cancelCrop = () => {
    setIsCropOpen(false);
    resetFileInput();
  };

  return {
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
    startWebcam,
    stopWebcam,
    takePhoto,
    handleFileUpload,
    handleCropSave,
    openWebcam,
    closeWebcam,
    cancelCrop
  };
};
