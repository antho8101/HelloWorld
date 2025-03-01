
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/layout/Footer";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { toast } from "sonner";
import type { ProfileData } from "@/types/profile";
import type { LanguageWithLevel } from "@/components/LanguageSelector";

export const ProfileEdit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setUserId(session.user.id);
      fetchProfile(session.user.id);
    };

    checkUser();
  }, [navigate]);

  const fetchProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("Profile not found");
        return;
      }

      // Transform native languages from string[] to LanguageWithLevel[]
      const nativeLanguages: LanguageWithLevel[] = Array.isArray(data.native_languages) 
        ? data.native_languages.map((lang: string) => ({ language: lang }))
        : [];

      // Ensure language_levels is properly formatted as LanguageWithLevel[]
      const languageLevels: LanguageWithLevel[] = Array.isArray(data.language_levels) 
        ? data.language_levels.map((item: any) => ({
            language: typeof item.language === 'string' ? item.language : '',
            level: typeof item.level === 'string' ? item.level : 'beginner'
          }))
        : [];

      const profileData: ProfileData = {
        id: data.id,
        username: data.username || null,
        name: data.name || null,
        age: data.age || null,
        avatar_url: data.avatar_url || null,
        native_languages: nativeLanguages,
        language_levels: languageLevels,
        country: data.country || null,
        city: data.city || null,
        bio: data.bio || null,
        gender: data.gender || null,
        interested_in: Array.isArray(data.interested_in) ? data.interested_in : [],
        looking_for: Array.isArray(data.looking_for) ? data.looking_for : [],
        is_suspended: data.is_suspended || false,
        is_banned: data.is_banned || false,
        suspension_end_timestamp: data.suspension_end_timestamp || null,
      };

      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCity = async (search: string) => {
    setCitySearch(search);
    if (search.length > 2 && profile?.country) {
      try {
        const { data: secretData, error: secretError } = await supabase
          .from('secrets')
          .select('value')
          .eq('name', 'API_NINJAS_KEY')
          .maybeSingle();

        if (secretError) throw secretError;
        if (!secretData) {
          console.error('API key not found');
          setCities([
            `${search} City`,
            `${search} Town`,
            `New ${search}`,
            `${search}ville`,
          ].map(city => `${city}, ${profile.country}`));
          return;
        }

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

  const handleProfileUpdate = async (updates: Partial<ProfileData>) => {
    if (!userId || !profile) return;

    try {
      // Transform the data for database storage
      const dbUpdates: any = { ...updates };
      
      // If we're updating native_languages, transform from LanguageWithLevel[] to string[]
      if (updates.native_languages) {
        dbUpdates.native_languages = updates.native_languages.map(lang => lang.language);
      }

      const { error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("id", userId);

      if (error) throw error;

      // Update the local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <main className="min-h-screen">
      <div className="bg-[rgba(255,243,240,1)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[80%] mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-black text-[#6153BD] mb-8">Edit your profile</h1>
          
          <ProfileForm
            userId={userId || ""}
            profile={profile}
            citySearch={citySearch}
            cities={cities}
            onProfileChange={handleProfileUpdate}
            onCitySearch={handleSearchCity}
            onCitySelect={(city) => {
              handleProfileUpdate({ city });
              setCitySearch(city);
              setCities([]);
            }}
            onSubmit={() => navigate(`/profile/${userId}`)}
          />
        </div>
      </div>
      <Footer />
    </main>
  );
};
