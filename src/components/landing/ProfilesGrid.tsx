
import React from "react";
import { UserProfile } from "./UserProfile";
import type { Profile } from "@/data/staticProfiles";

interface ProfilesGridProps {
  profiles: Profile[];
}

export const ProfilesGrid: React.FC<ProfilesGridProps> = ({ profiles }) => {
  return (
    <div className="flex w-full flex-col items-stretch text-black justify-center mt-20 max-md:max-w-full max-md:mt-10">
      <div className="grid grid-cols-7 gap-8 max-md:grid-cols-2 max-sm:grid-cols-1">
        {profiles.map((profile, index) => (
          <UserProfile
            key={index}
            image={profile.image}
            name={profile.name}
            age={profile.age}
            location={profile.location}
            isOnline={profile.isOnline}
          />
        ))}
      </div>
    </div>
  );
};
