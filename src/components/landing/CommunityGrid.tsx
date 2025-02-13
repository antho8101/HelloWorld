
import React, { useEffect, useState } from "react";
import { staticProfiles } from "@/data/staticProfiles";
import { CommunityTitle } from "./CommunityTitle";
import { ProfilesGrid } from "./ProfilesGrid";
import { supabase } from "@/integrations/supabase/client";

export const CommunityGrid: React.FC = () => {
  const [profiles, setProfiles] = useState(staticProfiles);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, age, location, image, avatar_url")
        .limit(21);

      if (!error && data) {
        const mappedProfiles = data.map(profile => ({
          id: profile.id,
          image: profile.avatar_url || profile.image || `https://i.pravatar.cc/150?u=${profile.id}`,
          name: profile.name || "Anonymous",
          age: profile.age || 25,
          location: profile.location || "Unknown",
          gender: "female" as const,  // Default value since we don't use it much
          messages: 0,
          isOnline: false
        }));
        setProfiles(mappedProfiles);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <section className="bg-white flex w-full flex-col items-stretch px-[220px] py-20 max-md:px-5">
      <CommunityTitle memberCount={profiles.length} />
      <ProfilesGrid profiles={profiles} />
    </section>
  );
};
