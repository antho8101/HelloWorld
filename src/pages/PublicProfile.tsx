
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

export const PublicProfile = () => {
  const params = useParams();
  const { profile, loading, error } = useProfile(params.id);
  const { currentUserId } = useSession();
  const { posts, fetchPosts } = usePosts(profile?.id, currentUserId);

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
