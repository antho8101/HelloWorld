
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import type { LanguageWithLevel } from "@/components/LanguageSelector";
import type { Json } from "@/integrations/supabase/types";
import { ProfileError } from "@/components/profile/ProfileError";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { LanguagesSection } from "@/components/profile/LanguagesSection";
import { InterestsSection } from "@/components/profile/InterestsSection";

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

export const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setError("No profile ID provided");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Supabase error:", error);
          setError(error.message);
          return;
        }

        if (!data) {
          setError("Profile not found");
          return;
        }

        setProfile({
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
          bio: data.bio
        });
        setError(null);
      } catch (err) {
        console.error("Error in fetchProfile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6153BD]"></div>
      </div>
    );
  }

  if (error) {
    return <ProfileError error={error} />;
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[rgba(255,243,240,1)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#6153BD] font-bold mb-8 hover:text-[#6153BD]/90 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <div className="bg-white/80 backdrop-blur-sm rounded-[20px] shadow-lg p-8">
          <ProfileHeader
            name={profile.name}
            username={profile.username}
            avatarUrl={profile.avatar_url}
            age={profile.age}
            city={profile.city}
            country={profile.country}
          />

          <div className="w-full space-y-6 mt-6">
            {profile.bio && (
              <div className="text-center text-gray-700 max-w-xl mx-auto">
                {profile.bio}
              </div>
            )}

            <LanguagesSection
              nativeLanguages={profile.native_languages}
              learningLanguages={profile.language_levels}
            />

            <InterestsSection
              interestedIn={profile.interested_in}
              lookingFor={profile.looking_for}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
