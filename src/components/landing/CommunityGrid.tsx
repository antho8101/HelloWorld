
import React, { useEffect, useState } from "react";
import { CommunityTitle } from "./CommunityTitle";
import { ProfilesGrid } from "./ProfilesGrid";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/data/staticProfiles";
import { toast } from "sonner";

export const CommunityGrid: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, age, city, country, avatar_url")
          .limit(20);

        if (error) throw error;

        if (data) {
          const mappedProfiles = data.map(profile => ({
            id: profile.id,
            image: profile.avatar_url || `https://i.pravatar.cc/150?u=${profile.id}`, // Fallback to pravatar if no avatar_url
            name: profile.name || "Anonymous",
            age: profile.age || 25,
            location: profile.city && profile.country ? `${profile.city}, ${profile.country}` : "Unknown",
            gender: "female" as const,
            messages: 0,
            isOnline: false
          }));
          setProfiles(mappedProfiles);
        }
      } catch (err) {
        console.error("Error fetching profiles:", err);
        toast.error("Unable to load community profiles");
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <section className="bg-white flex w-full flex-col items-stretch px-[220px] py-20 max-md:px-5">
        <CommunityTitle memberCount={0} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6153BD]"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white flex w-full flex-col items-stretch px-[220px] py-20 max-md:px-5">
      <CommunityTitle memberCount={profiles.length} />
      <ProfilesGrid profiles={profiles} />
    </section>
  );
};
