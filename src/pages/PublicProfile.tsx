import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { LanguageWithLevel } from "@/components/LanguageSelector";
import type { Json } from "@/integrations/supabase/types";
import { ProfileError } from "@/components/profile/ProfileError";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { LanguagesSection } from "@/components/profile/LanguagesSection";
import { InterestsSection } from "@/components/profile/InterestsSection";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";
import { CreatePost } from "@/components/posts/CreatePost";
import { Post } from "@/components/posts/Post";

interface Profile {
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  age: number | null;
  city: string | null;
  country: string | null;
  gender: string | null;
  native_languages: string[];
  language_levels: LanguageWithLevel[];
  interested_in: string[];
  looking_for: string[];
  bio: string | null;
  id: string | null;
}

const transformLanguageLevels = (languageLevels: Json | null): LanguageWithLevel[] => {
  if (!languageLevels || !Array.isArray(languageLevels)) return [];
  return languageLevels.map(level => {
    if (typeof level === 'object' && level !== null && 'language' in level) {
      return {
        language: String(level.language),
        level: 'level' in level ? String(level.level) : undefined
      };
    }
    return { language: String(level) };
  });
};

export const PublicProfile = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const profileId = params.id;
      if (!profileId) {
        setError("No profile ID provided");
        setLoading(false);
        return;
      }

      console.log("Fetching profile with ID:", profileId);

      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select(`
            id,
            username,
            name,
            avatar_url,
            age,
            city,
            country,
            gender,
            native_languages,
            language_levels,
            interested_in,
            looking_for,
            bio
          `)
          .eq("id", profileId)
          .maybeSingle();

        console.log("Profile data response:", { data, error: fetchError });

        if (fetchError) {
          console.error("Error fetching profile:", fetchError);
          toast.error("Error loading profile");
          setError(fetchError.message);
          return;
        }

        if (!data) {
          setError("Profile not found");
          return;
        }

        setProfile({
          id: data.id,
          username: data.username,
          name: data.name,
          avatar_url: data.avatar_url,
          age: data.age,
          city: data.city,
          country: data.country,
          gender: data.gender,
          native_languages: Array.isArray(data.native_languages) ? data.native_languages : [],
          language_levels: transformLanguageLevels(data.language_levels),
          interested_in: Array.isArray(data.interested_in) ? data.interested_in : [],
          looking_for: Array.isArray(data.looking_for) ? data.looking_for : [],
          bio: data.bio
        });
        setError(null);
      } catch (err) {
        console.error("Unexpected error in fetchProfile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (profile?.id) {
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select(`
            id,
            content,
            image_url,
            created_at,
            likes_count,
            user_id,
            profiles!user_id (
              id,
              name,
              username,
              avatar_url
            )
          `)
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false });

        if (postsError) {
          console.error("Error fetching posts:", postsError);
          return;
        }

        if (currentUserId) {
          const { data: likedPosts } = await supabase
            .from("post_likes")
            .select("post_id")
            .eq("user_id", currentUserId);

          const likedPostIds = new Set(likedPosts?.map(like => like.post_id) || []);

          const postsWithLikes = await Promise.all(
            postsData.map(async (post) => {
              const { data: comments } = await supabase
                .from("comments")
                .select(`
                  id,
                  content,
                  created_at,
                  likes_count,
                  profiles!user_id (
                    name,
                    username,
                    avatar_url
                  )
                `)
                .eq("post_id", post.id)
                .order("created_at", { ascending: true });

              return {
                ...post,
                isLiked: likedPostIds.has(post.id),
                comments: comments?.map(comment => ({
                  id: comment.id,
                  content: comment.content,
                  createdAt: comment.created_at,
                  author: {
                    name: comment.profiles.name,
                    username: comment.profiles.username,
                    avatarUrl: comment.profiles.avatar_url,
                  },
                  likesCount: comment.likes_count,
                  isLiked: false, // To be implemented
                })) || [],
              };
            })
          );

          setPosts(postsWithLikes);
        }
      }
    };

    if (profile) {
      fetchPosts();
    }
  }, [profile, currentUserId]);

  const handlePostCreated = () => {
    const fetchPosts = async () => {
      if (profile?.username) {
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select(`
            id,
            content,
            image_url,
            created_at,
            likes_count,
            profiles!inner (
              id,
              name,
              username,
              avatar_url
            )
          `)
          .eq("profiles.username", profile.username)
          .order("created_at", { ascending: false });

        if (postsError) {
          console.error("Error fetching posts:", postsError);
          return;
        }

        if (currentUserId) {
          const { data: likedPosts } = await supabase
            .from("post_likes")
            .select("post_id")
            .eq("user_id", currentUserId);

          const likedPostIds = new Set(likedPosts?.map(like => like.post_id) || []);

          const postsWithLikes = await Promise.all(
            postsData.map(async (post) => {
              const { data: comments } = await supabase
                .from("comments")
                .select(`
                  id,
                  content,
                  created_at,
                  likes_count,
                  profiles (
                    name,
                    username,
                    avatar_url
                  )
                `)
                .eq("post_id", post.id)
                .order("created_at", { ascending: true });

              return {
                ...post,
                isLiked: likedPostIds.has(post.id),
                comments: comments?.map(comment => ({
                  id: comment.id,
                  content: comment.content,
                  createdAt: comment.created_at,
                  author: {
                    name: comment.profiles.name,
                    username: comment.profiles.username,
                    avatarUrl: comment.profiles.avatar_url,
                  },
                  likesCount: comment.likes_count,
                  isLiked: false, // To be implemented
                })) || [],
              };
            })
          );

          setPosts(postsWithLikes);
        }
      }
    };
    fetchPosts();
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[rgba(255,243,240,1)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[746px] mx-auto space-y-8">
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
                />
              </div>
              
              {profile.bio && (
                <div className="flex-1 mt-6 md:mt-0 flex items-center">
                  <div className="text-gray-700">
                    {profile.bio}
                  </div>
                </div>
              )}
            </div>

            <div className="w-full space-y-6 mt-6">
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

          {currentUserId === profile?.id && (
            <CreatePost userId={currentUserId} onPostCreated={handlePostCreated} />
          )}

          <div className="space-y-6">
            {posts.map((post) => (
              <Post
                key={post.id}
                id={post.id}
                content={post.content}
                imageUrl={post.image_url}
                createdAt={post.created_at}
                likesCount={post.likes_count}
                author={{
                  id: post.profiles.id,
                  name: post.profiles.name,
                  username: post.profiles.username,
                  avatarUrl: post.profiles.avatar_url,
                }}
                currentUserId={currentUserId || ""}
                isLiked={post.isLiked}
                comments={post.comments}
              />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
