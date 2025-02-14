
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/layout/Footer";
import { ProfileError } from "@/components/profile/ProfileError";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { PostsList } from "@/components/profile/PostsList";
import { PhotoGallery } from "@/components/profile/PhotoGallery";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { FriendsSection } from "@/components/profile/FriendsSection";
import { ReportButton } from "@/components/profile/ReportButton";
import { ReportDialog } from "@/components/profile/ReportDialog";
import { AccountStatusAlerts } from "@/components/profile/AccountStatusAlerts";
import { useProfile } from "@/hooks/useProfile";
import { usePosts } from "@/hooks/usePosts";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PublicProfile = () => {
  const params = useParams();
  const { profile, loading, error } = useProfile(params.id);
  const { currentUserId } = useSession();
  const { posts, fetchPosts } = usePosts(profile?.id, currentUserId);
  const { toast } = useToast();
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const handleMessage = () => {
    // TODO: Implement messaging functionality
    console.log("Send message to:", profile?.id);
  };

  const handleReport = async () => {
    if (!reportReason) {
      toast({
        title: "Error",
        description: "Please select a reason for reporting",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error: reportError } = await supabase
        .from("reports")
        .insert({
          reporter_id: currentUserId,
          reported_user_id: profile?.id,
          reason: reportReason,
          description: reportDescription,
        });

      if (reportError) throw reportError;

      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe.",
      });
      
      setIsReportModalOpen(false);
      setReportReason("");
      setReportDescription("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6153BD]"></div>
        </div>
        <Footer />
      </>
    );
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
      <Header />
      <div className="min-h-screen bg-[rgba(255,243,240,1)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[900px] mx-auto grid grid-cols-[1fr,300px] gap-6">
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
              onPostCreated={fetchPosts}
            />
          </div>
          
          <div className="space-y-6">
            {!isOwnProfile && !profile.is_banned && !profile.is_suspended && (
              <ProfileActions
                onMessage={handleMessage}
                profileId={profile.id}
                currentUserId={currentUserId}
              />
            )}
            <FriendsSection />
            <PhotoGallery userId={profile.id} />
            {!isOwnProfile && !profile.is_banned && (
              <ReportButton onClick={() => setIsReportModalOpen(true)} />
            )}
          </div>
        </div>
      </div>
      <Footer />

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
