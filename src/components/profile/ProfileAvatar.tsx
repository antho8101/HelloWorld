
import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Camera, UploadSimple } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProfileAvatarProps {
  userId: string;
  username: string;
  avatarUrl: string;
  onAvatarChange: (url: string) => void;
}

export const ProfileAvatar = ({ userId, username, avatarUrl, onAvatarChange }: ProfileAvatarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const { toast } = useToast();

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
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
      const filePath = `${userId}/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onAvatarChange(publicUrl);
      setIsWebcamOpen(false);
      stopWebcam();
    } catch (error: any) {
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

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onAvatarChange(publicUrl);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error uploading avatar",
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Avatar className="h-64 w-64 ring-4 ring-[#FECFC4]/20">
          <AvatarImage src={avatarUrl} />
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
    </div>
  );
};
