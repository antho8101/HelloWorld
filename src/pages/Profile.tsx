
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Footer } from "@/components/layout/Footer";
import { LanguageSelector, type LanguageWithLevel } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Json } from "@/integrations/supabase/types";

const COUNTRIES = [
  "France", "United States", "United Kingdom", "Germany", "Spain", "Italy",
  "Canada", "Australia", "Japan", "China", "Brazil", "India"
] as const;

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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error uploading avatar",
      });
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

  const handleSearchCity = async (search: string) => {
    setCitySearch(search);
    if (search.length > 2 && profile.country) {
      try {
        // Get the API key from Supabase secrets
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
        // Fallback to simple suggestions if API fails
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

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error signing out",
      });
    } else {
      navigate("/");
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
            {/* Left side - Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-64 w-64 ring-4 ring-[#6153BD]/20">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-[#6153BD] text-white text-4xl">
                    {profile.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-10 w-10"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-10 w-10"
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Right side - Basic Info */}
            <div className="flex-1 max-w-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#6153BD] mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full border-2 border-[#6153BD]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#6153BD] focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#6153BD] mb-1">
                    Gender
                  </label>
                  <Select
                    value={profile.gender}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#6153BD] mb-1">
                    Country
                  </label>
                  <Select
                    value={profile.country}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#6153BD] mb-1">
                    City
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => handleSearchCity(e.target.value)}
                      disabled={!profile.country}
                      className="w-full border-2 border-[#6153BD]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#6153BD] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={profile.country ? "Start typing your city..." : "Please select a country first"}
                    />
                    {cities.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                        {cities.map((city) => (
                          <div
                            key={city}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              setProfile(prev => ({ ...prev, city }));
                              setCitySearch(city);
                              setCities([]);
                            }}
                          >
                            {city}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#6153BD] mb-2">
                Native Languages
              </label>
              <LanguageSelector
                languages={profile.native_languages}
                onChange={(languages) => setProfile(prev => ({ ...prev, native_languages: languages }))}
                showLevel={false}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#6153BD] mb-2">
                Learning Languages
              </label>
              <LanguageSelector
                languages={profile.learning_languages}
                onChange={(languages) => setProfile(prev => ({ ...prev, learning_languages: languages }))}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#6153BD] mb-2">
                I'm Looking For
              </label>
              <div className="space-y-2">
                {['friends', 'postal_exchange', 'in_person_meetings', 'flirting'].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={profile.looking_for.includes(option)}
                      onCheckedChange={(checked) => {
                        setProfile(prev => ({
                          ...prev,
                          looking_for: checked
                            ? [...prev.looking_for, option]
                            : prev.looking_for.filter(item => item !== option)
                        }));
                      }}
                    />
                    <label
                      htmlFor={option}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={updateProfile}
              className="w-full bg-[#6153BD] text-white py-3 px-4 rounded-xl font-bold hover:bg-[#6153BD]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6153BD] transform transition-all duration-200 hover:scale-[1.02]"
            >
              Continue to Bio
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
