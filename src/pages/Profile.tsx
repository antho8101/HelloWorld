
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/layout/Footer";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useProfile } from "@/hooks/use-profile";
import { RegisterHeader } from "@/components/profile/RegisterHeader";

export const Profile = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState("");
  const { profile, setProfile, loading, fetchProfile, updateProfile } = useProfile(userId);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
    };

    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId, fetchProfile]);

  const handleSearchCity = async (search: string) => {
    setCitySearch(search);
    if (search.length > 2 && profile.country) {
      try {
        const { data: secretData, error: secretError } = await supabase
          .from('secrets')
          .select('value')
          .eq('name', 'API_NINJAS_KEY')
          .maybeSingle();

        if (secretError) throw secretError;
        if (!secretData) {
          console.error('API key not found');
          // Fallback to mock data if no API key is found
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

  const handleSubmit = async () => {
    const success = await updateProfile();
    if (success) {
      navigate("/profile/bio");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="min-h-screen select-none">
      <RegisterHeader />

      <div className="bg-[rgba(255,243,240,1)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[80%] mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-black text-[#6153BD] mb-8">Create your profile</h1>
          
          <ProfileForm
            userId={userId || ""}
            profile={profile}
            citySearch={citySearch}
            cities={cities}
            onProfileChange={(updates) => setProfile(prev => ({ ...prev, ...updates }))}
            onCitySearch={handleSearchCity}
            onCitySelect={(city) => {
              setProfile(prev => ({ ...prev, city }));
              setCitySearch(city);
              setCities([]);
            }}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
      <Footer />
    </main>
  );
};
