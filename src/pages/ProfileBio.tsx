
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/Footer";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RegisterHeader } from "@/components/profile/RegisterHeader";

export const ProfileBio = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bio, setBio] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      fetchBio(session.user.id);
    };

    checkUser();
  }, [navigate]);

  const fetchBio = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("bio")
      .eq("id", userId)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error loading bio",
      });
      return;
    }

    if (data) {
      setBio(data.bio || "");
    }
  };

  const updateBio = async () => {
    if (bio.length < 50) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please write at least 50 characters in your bio",
      });
      return;
    }

    try {
      if (!userId) return;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          bio: bio,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bio updated successfully",
      });
      
      navigate(`/profile/${userId}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error updating bio",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <RegisterHeader />
      <div className="flex-grow bg-[rgba(255,243,240,1)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[80%] mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-black text-[#6153BD] mb-8">Tell us about yourself</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#6153BD] mb-2">
                Bio <span className="text-[#FF6A48]">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Minimum 50 characters.{" "}
                <span className={bio.length >= 50 ? "text-[#10b981]" : "text-[#ea384c]"}>
                  Current length: {bio.length}
                </span>
              </p>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={6}
                className="mt-1 block w-full border-2 border-[#6153BD]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#6153BD] focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Tell others about yourself, your interests, and what you're looking for..."
              />
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/profile")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={updateBio}
                className="flex-1 bg-[#6153BD] text-white hover:bg-[#6153BD]/90"
              >
                Save Bio
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
