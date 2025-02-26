
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PencilSimple } from "@phosphor-icons/react";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { FriendRequests } from "@/components/profile/FriendRequests";
import { FriendsSection } from "@/components/profile/FriendsSection";
import { PhotoGallery } from "@/components/profile/PhotoGallery";
import { ReportButton } from "@/components/profile/ReportButton";

interface ProfileSidebarProps {
  isOwnProfile: boolean;
  profile: any;
  currentUserId: string | null;
  friendRequests: any[];
  onMessage: () => void;
  onRequestHandled: () => void;
  onReportClick: () => void;
}

export const ProfileSidebar = ({
  isOwnProfile,
  profile,
  currentUserId,
  friendRequests,
  onMessage,
  onRequestHandled,
  onReportClick,
}: ProfileSidebarProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {!isOwnProfile && !profile.is_banned && !profile.is_suspended && (
        <ProfileActions
          onMessage={onMessage}
          profileId={profile.id}
          currentUserId={currentUserId}
        />
      )}
      {isOwnProfile && (
        <>
          <Button 
            onClick={() => navigate('/profile/edit')}
            className="bg-[rgba(97,83,189,1)] hover:bg-[rgba(97,83,189,0.9)] text-white flex items-center gap-2 w-full justify-center"
          >
            <PencilSimple size={20} weight="bold" />
            Edit Profile
          </Button>
          <FriendRequests
            requests={friendRequests}
            onRequestHandled={onRequestHandled}
          />
        </>
      )}
      <div>
        <FriendsSection />
      </div>
      <PhotoGallery userId={profile.id} />
      {!isOwnProfile && !profile.is_banned && (
        <ReportButton onClick={onReportClick} />
      )}
    </div>
  );
};
