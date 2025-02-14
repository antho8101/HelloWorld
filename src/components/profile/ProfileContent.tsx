
import React from "react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { LanguagesSection } from "@/components/profile/LanguagesSection";
import { InterestsSection } from "@/components/profile/InterestsSection";
import { PhotoGallery } from "@/components/profile/PhotoGallery";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import type { LanguageWithLevel } from "@/components/LanguageSelector";

interface ProfileContentProps {
  profile: {
    id: string | null;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    age: number | null;
    city: string | null;
    country: string | null;
    bio: string | null;
    native_languages: string[];
    language_levels: LanguageWithLevel[];
    interested_in: string[];
    looking_for: string[];
  };
}

export const ProfileContent: React.FC<ProfileContentProps> = ({ profile }) => {
  const isOnline = useOnlineStatus(profile.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-[20px] shadow-lg p-8">
        <div className="flex flex-col md:flex-row md:gap-12">
          <div className="w-fit">
            <ProfileHeader
              name={profile.name}
              username={profile.username}
              avatarUrl={profile.avatar_url}
              age={profile.age}
              city={profile.city}
              country={profile.country}
              isOnline={isOnline}
            />
          </div>
          
          {profile.bio && (
            <div className="flex-1 mt-6 md:mt-0 p-5">
              <div className="text-gray-700">
                {profile.bio}
              </div>
            </div>
          )}
        </div>

        <div className="w-full space-y-6 mt-6 border-t pt-6">
          <LanguagesSection
            nativeLanguages={profile.native_languages}
            learningLanguages={profile.language_levels}
          />

          <InterestsSection
            interestedIn={profile.interested_in}
            lookingFor={profile.looking_for}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <PhotoGallery userId={profile.id} />
        <div className="bg-white/80 backdrop-blur-sm rounded-[20px] p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-[#6153BD]">Friends</h3>
          <div className="text-gray-500 text-center">
            No friends yet
          </div>
        </div>
      </div>
    </div>
  );
};
