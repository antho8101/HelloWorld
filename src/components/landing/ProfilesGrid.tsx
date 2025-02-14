
import React from "react";
import { UserProfile } from "./UserProfile";
import type { Profile } from "@/data/staticProfiles";

interface ProfilesGridProps {
  profiles: Profile[];
}

export const ProfilesGrid: React.FC<ProfilesGridProps> = ({ profiles }) => {
  const displayedProfiles = window.innerWidth < 768 ? profiles.slice(0, 6) : profiles;

  return (
    <div className="flex w-full flex-col items-stretch text-black justify-center mt-20 max-md:mt-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {displayedProfiles.map((profile, index) => (
          <UserProfile
            key={index}
            image={profile.image}
            name={profile.name}
            age={profile.age}
            location={profile.location}
            id={profile.id}
          />
        ))}
      </div>
    </div>
  );
};
