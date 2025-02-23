
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

  const deletePhoto = async (photoUrl: string) => {
    if (!userId) return;

    try {
      // Delete from database first
      const { error: dbError } = await supabase
        .from('user_photos')
        .delete()
        .eq('photo_url', photoUrl);

      if (dbError) throw dbError;

      // Extract file path from public URL
      const filePath = photoUrl.split('/').slice(-2).join('/');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user_photos')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Update local state
      setPhotos(photos.filter(photo => photo !== photoUrl));
      toast.success("Photo deleted successfully");
    } catch (error: any) {
      console.error("Error deleting photo:", error);
      toast.error("Error deleting photo");
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [userId]);

  return {
    photos,
    loading,
    uploadPhoto,
    deletePhoto,
    fetchPhotos
  };
};
