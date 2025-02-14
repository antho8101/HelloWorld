
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/layout/Footer";
import { ProfileError } from "@/components/profile/ProfileError";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { PostsList } from "@/components/profile/PostsList";
import { PhotoGallery } from "@/components/profile/PhotoGallery";
import { useProfile } from "@/hooks/useProfile";
import { usePosts } from "@/hooks/usePosts";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChatText, UserPlus, Warning, X } from "@phosphor-icons/react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const handleAddFriend = () => {
    // TODO: Implement add friend functionality
    console.log("Add friend:", profile?.id);
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

  // Don't show action buttons if viewing own profile
  const isOwnProfile = currentUserId === profile.id;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[rgba(255,243,240,1)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[900px] mx-auto grid grid-cols-[1fr,300px] gap-6">
          <div className="space-y-6">
            {profile.is_banned && (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription>
                  This account has been banned for violating our community guidelines.
                </AlertDescription>
              </Alert>
            )}
            {profile.is_suspended && (
              <Alert variant="warning">
                <Warning className="h-4 w-4" />
                <AlertDescription>
                  This account is temporarily suspended until{" "}
                  {new Date(profile.suspension_end_timestamp || "").toLocaleDateString()}.
                </AlertDescription>
              </Alert>
            )}
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
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleMessage}
                  className="bg-[rgba(97,83,189,1)] flex items-center gap-2.5 text-white justify-center px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[rgba(97,83,189,0.9)] w-full"
                >
                  <ChatText size={20} weight="bold" />
                  Send Message
                </Button>
                <Button 
                  onClick={handleAddFriend}
                  className="bg-white gap-2.5 text-[#6153BD] whitespace-nowrap px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#6153BD] hover:text-white w-full"
                >
                  <UserPlus size={20} weight="bold" />
                  Add Friend
                </Button>
              </div>
            )}
            <PhotoGallery userId={profile.id} />
            <div className="bg-white/80 backdrop-blur-sm rounded-[20px] p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#6153BD]">Friends</h3>
              <div className="text-gray-500 text-center">
                No friends yet
              </div>
            </div>
            {!isOwnProfile && !profile.is_banned && (
              <div className="flex justify-center">
                <Button 
                  onClick={() => setIsReportModalOpen(true)}
                  variant="ghost"
                  className="text-gray-500 hover:text-red-600 text-sm flex items-center gap-1.5 py-1.5"
                >
                  <Warning size={16} weight="bold" />
                  Report inappropriate behavior
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />

      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold text-[#6153BD]">Report User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Reason</label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="fake_profile">Fake Profile</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Please provide more details about the issue..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsReportModalOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReport}
              className="bg-red-600 text-white hover:bg-red-700 flex-1 sm:flex-none"
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
