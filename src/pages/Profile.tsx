
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Footer } from "@/components/layout/Footer";

interface ProfileData {
  username: string;
  avatar_url: string;
  native_languages: string[];
  learning_languages: string[];
  country: string;
  bio: string;
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
    bio: "",
  });
  const [userId, setUserId] = useState<string | null>(null);

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
        .select("username, avatar_url, native_languages, learning_languages, country, bio")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          username: data.username || "",
          avatar_url: data.avatar_url || "",
          native_languages: data.native_languages || [],
          learning_languages: data.learning_languages || [],
          country: data.country || "",
          bio: data.bio || "",
        });
      } else {
        // If no profile exists, create one
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

  const updateProfile = async () => {
    try {
      if (!userId) return;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          ...profile,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error("Error in updateProfile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error updating profile",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleLanguagesChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'native_languages' | 'learning_languages') => {
    const languages = e.target.value.split(',').map(lang => lang.trim());
    setProfile(prev => ({ ...prev, [type]: languages }));
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
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-[#6153BD]">My Profile</h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-[#FF6A48] hover:text-[#FF6A48]/90 font-bold"
            >
              Sign Out
            </button>
          </div>

          <div className="flex flex-col items-center mb-8">
            <Avatar className="h-32 w-32 mb-4 ring-4 ring-[#6153BD]/20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-[#6153BD] text-white">
                {profile.username?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#6153BD]">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={profile.username}
                onChange={handleInputChange}
                className="mt-1 block w-full border-2 border-[#6153BD]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#6153BD] focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#6153BD]">
                Avatar URL
              </label>
              <input
                type="url"
                name="avatar_url"
                value={profile.avatar_url}
                onChange={handleInputChange}
                className="mt-1 block w-full border-2 border-[#6153BD]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#6153BD] focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#6153BD]">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={profile.country}
                onChange={handleInputChange}
                className="mt-1 block w-full border-2 border-[#6153BD]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#6153BD] focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#6153BD]">
                Native Languages (comma-separated)
              </label>
              <input
                type="text"
                value={profile.native_languages.join(', ')}
                onChange={(e) => handleLanguagesChange(e, 'native_languages')}
                className="mt-1 block w-full border-2 border-[#6153BD]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#6153BD] focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#6153BD]">
                Learning Languages (comma-separated)
              </label>
              <input
                type="text"
                value={profile.learning_languages.join(', ')}
                onChange={(e) => handleLanguagesChange(e, 'learning_languages')}
                className="mt-1 block w-full border-2 border-[#6153BD]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#6153BD] focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#6153BD]">
                Bio
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full border-2 border-[#6153BD]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#6153BD] focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>

            <button
              onClick={updateProfile}
              className="w-full bg-[#6153BD] text-white py-3 px-4 rounded-xl font-bold hover:bg-[#6153BD]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6153BD] transform transition-all duration-200 hover:scale-[1.02]"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
