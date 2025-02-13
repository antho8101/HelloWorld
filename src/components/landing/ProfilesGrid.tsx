
import React from "react";
import { UserProfile } from "./UserProfile";
import type { Profile } from "@/data/staticProfiles";

interface ProfilesGridProps {
  profiles: Profile[];
}

export const ProfilesGrid: React.FC<ProfilesGridProps> = ({ profiles }) => {
  // On mobile, we'll only show the first 6 profiles
  const displayedProfiles = window.innerWidth < 768 ? profiles.slice(0, 6) : profiles;

  return (
    <div className="flex w-full flex-col items-stretch text-black justify-center mt-20 max-md:mt-10">
      <div className="grid grid-cols-7 gap-6 max-md:grid-cols-2 max-sm:grid-cols-1">
        {displayedProfiles.map((profile, index) => (
          <UserProfile
            key={index}
            image={profile.image}
            name={profile.name}
            age={profile.age}
            location={profile.location}
            isOnline={profile.isOnline}
            id={profile.id || ""}
          />
        ))}
      </div>
    </div>
  );
};
