
import React from "react";
import { staticProfiles } from "@/data/staticProfiles";
import { CommunityTitle } from "./CommunityTitle";
import { ProfilesGrid } from "./ProfilesGrid";

export const CommunityGrid: React.FC = () => {
  return (
    <section className="bg-white flex w-full flex-col items-stretch px-[220px] py-20 max-md:max-w-full max-md:px-5">
      <CommunityTitle memberCount={staticProfiles.length} />
      <ProfilesGrid profiles={staticProfiles} />
    </section>
  );
};
