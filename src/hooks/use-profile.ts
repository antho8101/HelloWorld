
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ProfileData } from "@/types/profile";
import type { Json } from "@/integrations/supabase/types";
import type { LanguageWithLevel } from "@/components/LanguageSelector";

// Helper function to transform JSON to LanguageWithLevel[]
const transformLanguageLevels = (languageLevels: Json | null): LanguageWithLevel[] => {
  if (!languageLevels || !Array.isArray(languageLevels)) return [];
  
  return languageLevels.map(level => {
    if (typeof level === 'object' && level !== null && 'language' in level) {
      return {
        language: String(level.language),
        level: 'level' in level ? String(level.level) : undefined
      };
    }
    return { language: String(level) };
  });
};

export const useProfile = (userId: string | null) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    username: null,
    name: null,
    age: null,
    avatar_url: null,
    native_languages: [],
    language_levels: [],
    country: null,
    city: null,
    bio: null,
    gender: null,
    interested_in: [],
    looking_for: [],
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
          id: data.id,
          username: data.username || null,
          name: data.name || null,
          age: data.age || null,
          avatar_url: data.avatar_url || null,
          native_languages: Array.isArray(data.native_languages) 
            ? data.native_languages.map((lang: string) => ({ language: lang })) 
            : [],
          language_levels: transformLanguageLevels(data.language_levels),
          country: data.country || null,
          city: data.city || null,
          bio: data.bio || null,
          gender: data.gender || null,
          interested_in: Array.isArray(data.interested_in) ? data.interested_in : [],
          looking_for: Array.isArray(data.looking_for) ? data.looking_for : [],
          is_suspended: data.is_suspended,
          is_banned: data.is_banned,
          suspension_end_timestamp: data.suspension_end_timestamp,
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
      // Convert language_levels to JSON format before storing
      const languageLevelsForDb = profile.language_levels.map(lang => ({
        language: lang.language,
        level: lang.level
      }));

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          username: profile.username,
          name: profile.name,
          age: profile.age,
          avatar_url: profile.avatar_url,
          native_languages: profile.native_languages.map(lang => lang.language),
          language_levels: languageLevelsForDb,
          country: profile.country,
          city: profile.city,
          gender: profile.gender,
          interested_in: profile.interested_in,
          looking_for: profile.looking_for,
          bio: profile.bio,
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
