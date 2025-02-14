
import { supabase } from "@/integrations/supabase/client";
import type { Crop } from 'react-image-crop';

export const uploadToSupabase = async (file: File | Blob, userId: string, fileExt: string) => {
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

export const getCroppedImg = async (
  imgRef: HTMLImageElement,
  crop: Crop
): Promise<Blob | null> => {
  if (!crop.width || !crop.height) return null;

  const canvas = document.createElement('canvas');
  const scaleX = imgRef.naturalWidth / imgRef.width;
  const scaleY = imgRef.naturalHeight / imgRef.height;

  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  ctx.drawImage(
    imgRef,
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
