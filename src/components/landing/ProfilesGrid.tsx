
import React from "react";
import { UserProfile } from "./UserProfile";
import { staticProfiles } from "@/data/staticProfiles";

interface ProfilesGridProps {
  onProfileClick: (id: string) => void;
}

export const ProfilesGrid = ({ onProfileClick }: ProfilesGridProps) => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#6153BD]">
          Meet Our Community
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {staticProfiles.map((profile) => (
            <UserProfile
              key={profile.id}
              id={profile.id}
              name={profile.name}
              languages={profile.languages}
              avatar={profile.avatar}
              onClick={onProfileClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
