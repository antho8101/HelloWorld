
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PublicProfile = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { profile, loading, error } = useProfile(params.id);
  const { currentUserId } = useSession();
  const { posts, fetchPosts } = usePosts(profile?.id, currentUserId);
  const { toast } = useToast();
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    if (currentUserId) {
      fetchFriendRequests();
    }
  }, [currentUserId]);

  const fetchFriendRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          id,
          created_at,
          sender:sender_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('receiver_id', currentUserId)
        .eq('status', 'pending');

      if (error) throw error;
      setFriendRequests(data || []);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleMessage = async () => {
    if (!currentUserId) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You need to be logged in to send messages.",
      });
      return;
    }
    
    // The actual functionality is now handled in the ProfileActions component
    console.log("Message action initiated for user:", profile?.id);
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
          onRequestHandled={fetchFriendRequests}
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
