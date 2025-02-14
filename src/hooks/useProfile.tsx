
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LanguageWithLevel } from "@/components/LanguageSelector";
import type { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

interface Profile {
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  age: number | null;
  city: string | null;
  country: string | null;
  gender: string | null;
  native_languages: string[];
  language_levels: LanguageWithLevel[];
  interested_in: string[];
  looking_for: string[];
  bio: string | null;
  id: string | null;
  is_banned: boolean | null;
  is_suspended: boolean | null;
  suspension_end_timestamp: string | null;
}

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

export const useProfile = (profileId: string | undefined) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setError("No profile ID provided");
        setLoading(false);
        return;
      }

      console.log("Fetching profile with ID:", profileId);

      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select(`
            id,
            username,
            name,
            avatar_url,
            age,
            city,
            country,
            gender,
            native_languages,
            language_levels,
            interested_in,
            looking_for,
            bio,
            is_banned,
            is_suspended,
            suspension_end_timestamp
          `)
          .eq("id", profileId)
          .maybeSingle();

        console.log("Profile data response:", { data, error: fetchError });

        if (fetchError) {
          console.error("Error fetching profile:", fetchError);
          toast.error("Error loading profile");
          setError(fetchError.message);
          return;
        }

        if (!data) {
          setError("Profile not found");
          return;
        }

        setProfile({
          id: data.id,
          username: data.username,
          name: data.name,
          avatar_url: data.avatar_url,
          age: data.age,
          city: data.city,
          country: data.country,
          gender: data.gender,
          native_languages: Array.isArray(data.native_languages) ? data.native_languages : [],
          language_levels: transformLanguageLevels(data.language_levels),
          interested_in: Array.isArray(data.interested_in) ? data.interested_in : [],
          looking_for: Array.isArray(data.looking_for) ? data.looking_for : [],
          bio: data.bio,
          is_banned: data.is_banned,
          is_suspended: data.is_suspended,
          suspension_end_timestamp: data.suspension_end_timestamp
        });
        setError(null);
      } catch (err) {
        console.error("Unexpected error in fetchProfile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  return { profile, loading, error };
};
