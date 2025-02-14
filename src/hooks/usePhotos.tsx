
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePhotos = (userId: string | null) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("user_photos")
        .select("photo_url")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPhotos(data.map(photo => photo.photo_url));
    } catch (error: any) {
      console.error("Error fetching photos:", error);
      toast.error("Error loading photos");
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!userId) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('user_photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user_photos')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('user_photos')
        .insert({
          user_id: userId,
          photo_url: publicUrl
        });

      if (dbError) throw dbError;

      await fetchPhotos();
      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error("Error uploading photo");
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [userId]);

  return {
    photos,
    loading,
    uploadPhoto
  };
};
