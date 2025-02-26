
import React from "react";
import { AccountStatusAlerts } from "@/components/profile/AccountStatusAlerts";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { PostsList } from "@/components/profile/PostsList";

interface MainProfileSectionProps {
  profile: any;
  posts: any[];
  currentUserId: string | null;
  onPostCreated: () => void;
}

export const MainProfileSection = ({
  profile,
  posts,
  currentUserId,
  onPostCreated,
}: MainProfileSectionProps) => {
  return (
    <div className="space-y-6">
      <AccountStatusAlerts
        isBanned={profile.is_banned || false}
        isSuspended={profile.is_suspended || false}
        suspensionEndTimestamp={profile.suspension_end_timestamp}
      />
      <ProfileContent profile={profile} />
      <PostsList
        posts={posts}
        currentUserId={currentUserId}
        profileId={profile.id}
        onPostCreated={onPostCreated}
      />
    </div>
  );
};
