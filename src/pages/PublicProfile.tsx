
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface Profile {
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  age: number | null;
  location: string | null;
  gender: string | null;
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
          .select("username, name, avatar_url, age, location, gender")
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
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#6153BD] font-bold mb-8 hover:text-[#6153BD]/90 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>

      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-[20px] shadow-lg p-8">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>
              {profile.name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="text-center space-y-2">
            {profile.name && (
              <h1 className="text-3xl font-bold text-[#6153BD]">{profile.name}</h1>
            )}
            {profile.username && (
              <p className="text-xl text-gray-600">@{profile.username}</p>
            )}
          </div>

          <div className="w-full max-w-md mt-8 space-y-4">
            {profile.age && (
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-500">Age</span>
                <span className="text-gray-900">{profile.age}</span>
              </div>
            )}
            {profile.location && (
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-500">Location</span>
                <span className="text-gray-900">{profile.location}</span>
              </div>
            )}
            {profile.gender && (
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-500">Gender</span>
                <span className="text-gray-900">{profile.gender}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
