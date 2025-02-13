
import React, { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Camera, UploadSimple } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileAvatarProps {
  userId: string;
  username: string;
  avatarUrl: string;
  onAvatarChange: (url: string) => void;
}

export const ProfileAvatar = ({ userId, username, avatarUrl, onAvatarChange }: ProfileAvatarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    </div>
  );
};
