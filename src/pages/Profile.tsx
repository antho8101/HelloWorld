
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/Footer";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { BasicInfo } from "@/components/profile/BasicInfo";
import { LanguagesAndPreferences } from "@/components/profile/LanguagesAndPreferences";
import type { LanguageWithLevel } from "@/components/LanguageSelector";
import type { Json } from "@/integrations/supabase/types";

interface ProfileData {
  username: string;
  avatar_url: string;
  native_languages: LanguageWithLevel[];
  learning_languages: LanguageWithLevel[];
  country: string;
  city: string;
  bio: string;
  gender: string;
  interested_in: string[];
  looking_for: string[];
  language_levels: LanguageWithLevel[];
}

export const Profile = () => {
  const navigate = useNavigate();
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
  const [userId, setUserId] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      fetchProfile(session.user.id);
    };

    checkUser();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
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
  };

  const handleSearchCity = async (search: string) => {
    setCitySearch(search);
    if (search.length > 2 && profile.country) {
      try {
        const { data: secretData, error: secretError } = await supabase
          .from('secrets')
          .select('value')
          .eq('name', 'API_NINJAS_KEY')
          .single();

        if (secretError) throw secretError;

        const response = await fetch(
          `https://api.api-ninjas.com/v1/city?name=${search}&country=${profile.country}&limit=5`,
          {
            headers: {
              'X-Api-Key': secretData.value
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }
        
        const data = await response.json();
        setCities(data.map((city: any) => city.name));
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities([
          `${search} City`,
          `${search} Town`,
          `New ${search}`,
          `${search}ville`,
        ].map(city => `${city}, ${profile.country}`));
      }
    } else {
      setCities([]);
    }
  };

  const updateProfile = async () => {
    try {
      if (!userId) return;

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
      
      navigate("/profile/bio");
    } catch (error: any) {
      console.error("Error in updateProfile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error updating profile",
      });
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6153BD]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow bg-[rgba(255,243,240,1)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[80%] mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-[#6153BD]">Create a Profile</h1>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-[#FF6A48] hover:text-[#FF6A48]/90 font-bold"
            >
              Cancel
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <ProfileAvatar
              userId={userId || ""}
              username={profile.username}
              avatarUrl={profile.avatar_url}
              onAvatarChange={(url) => setProfile(prev => ({ ...prev, avatar_url: url }))}
            />

            <BasicInfo
              username={profile.username}
              gender={profile.gender}
              country={profile.country}
              city={profile.city}
              citySearch={citySearch}
              cities={cities}
              onUsernameChange={(username) => setProfile(prev => ({ ...prev, username }))}
              onGenderChange={(gender) => setProfile(prev => ({ ...prev, gender }))}
              onCountryChange={(country) => setProfile(prev => ({ ...prev, country }))}
              onCitySearch={handleSearchCity}
              onCitySelect={(city) => {
                setProfile(prev => ({ ...prev, city }));
                setCitySearch(city);
                setCities([]);
              }}
            />
          </div>

          <LanguagesAndPreferences
            nativeLanguages={profile.native_languages}
            learningLanguages={profile.learning_languages}
            lookingFor={profile.looking_for}
            onNativeLanguagesChange={(languages) => setProfile(prev => ({ ...prev, native_languages: languages }))}
            onLearningLanguagesChange={(languages) => setProfile(prev => ({ ...prev, learning_languages: languages }))}
            onLookingForChange={(lookingFor) => setProfile(prev => ({ ...prev, looking_for: lookingFor }))}
          />

          <button
            onClick={updateProfile}
            className="w-full bg-[#6153BD] text-white py-3 px-4 rounded-xl font-bold hover:bg-[#6153BD]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6153BD] transform transition-all duration-200 hover:scale-[1.02] mt-6"
          >
            Continue to Bio
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};
