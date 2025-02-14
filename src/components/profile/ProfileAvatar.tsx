
import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Camera, UploadSimple } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ProfileAvatarProps {
  userId: string;
  username: string;
  avatarUrl: string;
  onAvatarChange: (url: string) => void;
}

export const ProfileAvatar = ({ userId, username, avatarUrl, onAvatarChange }: ProfileAvatarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
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

  console.log("Current avatarUrl:", avatarUrl); // Debug log

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

  const uploadToSupabase = async (file: File | Blob, fileExt: string) => {
    try {
      const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;
      console.log("Uploading to path:", filePath);

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful:", data);

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log("Generated public URL:", publicUrl);
      return publicUrl;
    } catch (error: any) {
      console.error("Error in uploadToSupabase:", error);
      throw new Error("Error uploading avatar");
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
      const publicUrl = await uploadToSupabase(blob, 'jpg');
      console.log("Photo taken and uploaded, public URL:", publicUrl);
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

  const getCroppedImg = async () => {
    if (!imgRef.current || !crop.width || !crop.height) return;

    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 1);
    });
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
      const croppedBlob = await getCroppedImg();
      if (!croppedBlob) return;

      const publicUrl = await uploadToSupabase(croppedBlob, 'jpg');
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

      {/* Webcam Dialog */}
      <Dialog open={isWebcamOpen} onOpenChange={(open) => {
        if (!open) {
          stopWebcam();
        }
        setIsWebcamOpen(open);
      }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Take a Photo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg bg-muted"
            />
            <div className="flex gap-2">
              <Button 
                onClick={takePhoto}
                className="bg-[#6153BD] hover:bg-[#6153BD]/90 text-white border-2 border-[rgba(18,0,113,1)]"
              >
                Take Photo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsWebcamOpen(false);
                  stopWebcam();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Crop Dialog */}
      <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="max-h-[500px] overflow-auto">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={cropImage}
                  alt="Crop preview"
                  className="max-w-full h-auto"
                />
              </ReactCrop>
            </div>
            <DialogFooter className="flex gap-2 w-full">
              <Button
                className="bg-[#6153BD] hover:bg-[#6153BD]/90 text-white border-2 border-[rgba(18,0,113,1)]"
                onClick={handleCropSave}
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCropOpen(false);
                  resetFileInput();
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
