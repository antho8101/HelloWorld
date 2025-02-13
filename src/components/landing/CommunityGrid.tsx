
import React, { useEffect, useState } from "react";
import { staticProfiles } from "@/data/staticProfiles";
import { CommunityTitle } from "./CommunityTitle";
import { ProfilesGrid } from "./ProfilesGrid";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  name: string;
  languages: string[];
  avatar?: string;
}

export const CommunityGrid: React.FC = () => {
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, native_languages, avatar_url")
        .limit(21);

      if (!error && data) {
        setMemberCount(data.length);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <section className="bg-white flex w-full flex-col items-stretch px-[220px] py-20 max-md:px-5">
      <CommunityTitle memberCount={memberCount} />
      <ProfilesGrid onProfileClick={id => console.log('Profile clicked:', id)} />
    </section>
  );
};
