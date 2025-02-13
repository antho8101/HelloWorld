
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ProfileData } from "@/types/profile";
import type { Json } from "@/integrations/supabase/types";

export const useProfile = (userId: string | null) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    username: "",
    avatar_url: "",
    native_languages: [],
    learning_languages: [],
    country: "",
    city: "",
    bio: "",
    gender: "",
    interested_in: [],
    looking_for: [],
    language_levels: [],
  });

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          username: data.username || "",
          avatar_url: data.avatar_url || "",
          native_languages: Array.isArray(data.native_languages) 
            ? data.native_languages.map((lang: string) => ({ language: lang })) 
            : [],
          learning_languages: Array.isArray(data.language_levels) 
            ? (data.language_levels as { language: string; level: string }[])
            : [],
          country: data.country || "",
          city: data.city || "",
          bio: data.bio || "",
          gender: data.gender || "",
          interested_in: Array.isArray(data.interested_in) ? data.interested_in : [],
          looking_for: Array.isArray(data.looking_for) ? data.looking_for : [],
          language_levels: [],
        });
      } else {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert([{ id: userId }])
          .select()
          .single();

        if (insertError) throw insertError;
      }
    } catch (error: any) {
      console.error("Error in fetchProfile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error loading profile",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateProfile = async () => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          username: profile.username,
          avatar_url: profile.avatar_url,
          native_languages: profile.native_languages.map(lang => lang.language),
          language_levels: profile.learning_languages as unknown as Json,
          country: profile.country,
          city: profile.city,
          gender: profile.gender,
          interested_in: profile.interested_in,
          looking_for: profile.looking_for,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      return true;
    } catch (error: any) {
      console.error("Error in updateProfile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error updating profile",
      });
      return false;
    }
  };

  return {
    profile,
    setProfile,
    loading,
    fetchProfile,
    updateProfile,
  };
};
