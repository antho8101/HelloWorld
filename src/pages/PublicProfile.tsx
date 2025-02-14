
import React from "react";
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
import { ChatText, UserPlus } from "@phosphor-icons/react";

export const PublicProfile = () => {
  const params = useParams();
  const { profile, loading, error } = useProfile(params.id);
  const { currentUserId } = useSession();
  const { posts, fetchPosts } = usePosts(profile?.id, currentUserId);
  
  const handleMessage = () => {
    // TODO: Implement messaging functionality
    console.log("Send message to:", profile?.id);
  };

  const handleAddFriend = () => {
    // TODO: Implement add friend functionality
    console.log("Add friend:", profile?.id);
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
            <ProfileContent profile={profile} />
            <PostsList
              posts={posts}
              currentUserId={currentUserId}
              profileId={profile.id}
              onPostCreated={fetchPosts}
            />
          </div>
          
          <div className="space-y-6">
            {!isOwnProfile && (
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleMessage}
                  className="w-full bg-[#6153BD] text-white hover:bg-[#6153BD]/90"
                >
                  <ChatText size={20} weight="bold" />
                  Send Message
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleAddFriend}
                  className="w-full border-[#6153BD] text-[#6153BD] hover:bg-[#6153BD]/10"
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
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
