
import React from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/layout/Footer";
import { LoadingSpinner } from "@/components/profile/LoadingSpinner";
import { ProfileLayout } from "@/components/profile/ProfileLayout";
import { MainProfileSection } from "@/components/profile/MainProfileSection";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ProfileError } from "@/components/profile/ProfileError";
import { ReportDialog } from "@/components/profile/ReportDialog";
import { useProfile } from "@/hooks/useProfile";
import { usePosts } from "@/hooks/usePosts";
import { useSession } from "@/hooks/useSession";
import { usePublicProfile } from "@/hooks/usePublicProfile";

export const PublicProfile = () => {
  const params = useParams();
  const { profile, loading, error } = useProfile(params.id);
  const { currentUserId } = useSession();
  const { posts, fetchPosts } = usePosts(profile?.id, currentUserId);
  
  const {
    isReportModalOpen,
    setIsReportModalOpen,
    reportReason,
    setReportReason,
    reportDescription,
    setReportDescription,
    friendRequests,
    handleMessage,
    handleReport,
  } = usePublicProfile(profile, currentUserId);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <>
        <Header />
        <ProfileError error={error} />
        <Footer />
      </>
    );
  }

  if (!profile) return null;

  const isOwnProfile = currentUserId === profile.id;

  return (
    <>
      <ProfileLayout>
        <MainProfileSection
          profile={profile}
          posts={posts}
          currentUserId={currentUserId}
          onPostCreated={fetchPosts}
        />
        <ProfileSidebar
          isOwnProfile={isOwnProfile}
          profile={profile}
          currentUserId={currentUserId}
          friendRequests={friendRequests}
          onMessage={handleMessage}
          onRequestHandled={() => {}}
          onReportClick={() => setIsReportModalOpen(true)}
        />
      </ProfileLayout>

      <ReportDialog
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        reason={reportReason}
        onReasonChange={setReportReason}
        description={reportDescription}
        onDescriptionChange={(e) => setReportDescription(e.target.value)}
        onSubmit={handleReport}
      />
    </>
  );
};
