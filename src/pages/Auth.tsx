
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { RegisterHeader } from "@/components/profile/RegisterHeader";

export const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignUp = location.state?.mode === 'signup';
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data?.user) {
        // First check if the user has a profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          // If there's an error or no profile, redirect to profile creation
          navigate("/profile");
        } else {
          // If profile exists, redirect to public profile
          navigate(`/profile/${data.user.id}`);
        }
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data?.user) {
        navigate("/profile");
        toast.success("Please check your email to verify your account");
      }
    } catch (error) {
      toast.error("An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[rgba(255,243,240,1)]">
      <RegisterHeader />
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-[20px] shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isSignUp 
                ? "Join our community and start your language learning journey" 
                : "Sign in to your account or create a new one"}
            </p>
          </div>
          <form className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#6153BD] focus:border-[#6153BD] focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#6153BD] focus:border-[#6153BD] focus:z-10 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {isSignUp ? (
                <>
                  <Button
                    onClick={handleSignUp}
                    disabled={loading}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#6153BD] hover:bg-[#4e4494] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6153BD]"
                  >
                    {loading ? "Loading..." : "Sign up"}
                  </Button>
                  <Button
                    onClick={handleLogin}
                    disabled={loading}
                    variant="outline"
                    className="group relative w-full flex justify-center py-2 px-4 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6153BD]"
                  >
                    {loading ? "Loading..." : "Sign in"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleLogin}
                    disabled={loading}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#6153BD] hover:bg-[#4e4494] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6153BD]"
                  >
                    {loading ? "Loading..." : "Sign in"}
                  </Button>
                  <Button
                    onClick={handleSignUp}
                    disabled={loading}
                    variant="outline"
                    className="group relative w-full flex justify-center py-2 px-4 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6153BD]"
                  >
                    {loading ? "Loading..." : "Sign up"}
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
