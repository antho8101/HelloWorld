
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProfileError } from "@/components/profile/ProfileError";
import { useSession } from "@/hooks/useSession";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { FriendsSection } from "@/components/profile/FriendsSection";
import { PhotoGallery } from "@/components/profile/PhotoGallery";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { AccountStatusAlerts } from "@/components/profile/AccountStatusAlerts";
import { Button } from "@/components/ui/button";
import { PencilSimple } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

export const PublicProfile: FC = () => {
  const { id } = useParams();
  const { currentUserId } = useSession();
  const { profile, loading, error } = useProfile(id);
  const isOnline = useOnlineStatus(id);
  const navigate = useNavigate();
  const isOwnProfile = currentUserId === id;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !profile) {
    return <ProfileError error={error} />;
  }

  return (
    <main className="min-h-screen bg-[rgba(255,243,240,1)] py-12">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {profile.is_banned && (
            <AccountStatusAlerts
              isBanned={profile.is_banned}
              isSuspended={false}
              suspensionEndTimestamp={null}
            />
          )}
          {!profile.is_banned && profile.is_suspended && (
            <AccountStatusAlerts
              isBanned={false}
              isSuspended={profile.is_suspended}
              suspensionEndTimestamp={profile.suspension_end_timestamp}
            />
          )}

          <div className="flex flex-col items-center mb-8">
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

          <div className="space-y-6">
            {isOwnProfile && (
              <div className="flex justify-end">
                <Button 
                  onClick={() => navigate('/profile/edit')}
                  className="bg-[rgba(97,83,189,1)] hover:bg-[rgba(97,83,189,0.9)] text-white flex items-center gap-2"
                >
                  <PencilSimple size={20} weight="bold" />
                  Edit Profile
                </Button>
              </div>
            )}
            <FriendsSection userId={id || ""} currentUserId={currentUserId} />
            <PhotoGallery userId={id || ""} />
          </div>
        </div>
      </div>
    </main>
  );
};
