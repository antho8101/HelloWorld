
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { User } from "@phosphor-icons/react";
import type { LanguageWithLevel } from "@/components/LanguageSelector";

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

export const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No profile ID provided",
        });
        navigate("/");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }
        
        if (!data) {
          toast({
            variant: "destructive",
            title: "Not Found",
            description: "Profile not found",
          });
          navigate("/");
          return;
        }
        
        setProfile(data);
      } catch (error: any) {
        console.error("Error in fetchProfile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6153BD]"></div>
      </div>
    );
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
          <div className="flex flex-col items-center space-y-6">
            <Avatar className="h-32 w-32 ring-4 ring-[#FECFC4]/20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-[#FECFC4]">
                <User size={48} weight="bold" />
              </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-[#6153BD]">
                {profile.name || profile.username}
                {profile.age && <span className="ml-2">{profile.age}</span>}
              </h1>
              {profile.username && profile.name && (
                <p className="text-xl text-gray-600">@{profile.username}</p>
              )}
              {(profile.city || profile.country) && (
                <p className="text-lg text-gray-600">
                  {[profile.city, profile.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>

            <div className="w-full space-y-6">
              {profile.bio && (
                <div className="text-center text-gray-700 max-w-xl mx-auto">
                  {profile.bio}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-[#6153BD]">Native Languages</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.native_languages?.map((lang) => (
                      <Badge key={lang} variant="secondary">{lang}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-[#6153BD]">Learning Languages</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.language_levels?.map((lang) => (
                      <Badge key={lang.language} variant="outline" className="space-x-1">
                        <span>{lang.language}</span>
                        {lang.level && <span className="text-gray-500">({lang.level})</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                {profile.interested_in?.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-[#6153BD] mb-2">Looking to Meet</h2>
                    <p className="text-gray-700 capitalize">
                      {profile.interested_in.join(", ")}
                    </p>
                  </div>
                )}

                {profile.looking_for?.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-[#6153BD] mb-2">Interested In</h2>
                    <div className="space-y-1">
                      {profile.looking_for.map((interest) => (
                        <div key={interest} className="text-gray-700 capitalize">
                          {interest.split('_').join(' ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
