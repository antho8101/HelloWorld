import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export const Auth = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/profile");
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Try to sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/auth'
          }
        });
        
        if (signUpError) {
          if (signUpError.message === "Email signups are disabled") {
            toast({
              variant: "destructive",
              title: "Signup Error",
              description: "Email signups are currently disabled. Please contact the administrator.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Signup Error",
              description: signUpError.message,
            });
          }
          return;
        }

        // If signup successful and user is created
        if (signUpData.user) {
          // Wait a bit to ensure the trigger has time to create the profile
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if profile exists
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signUpData.user.id)
            .single();

          if (profileError) {
            console.error('Profile creation error:', profileError);
            toast({
              variant: "destructive",
              title: "Profile Creation Error",
              description: "There was an issue creating your profile. Please try again.",
            });
            return;
          }

          if (profileData) {
            toast({
              title: "Account created successfully!",
              description: "Welcome to HelloWorld! Let's set up your profile.",
            });
            navigate("/profile");
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message === "Invalid login credentials") {
            toast({
              variant: "destructive",
              title: "Login Failed",
              description: "Invalid email or password. Please check your credentials and try again.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Login Error",
              description: error.message,
            });
          }
          return;
        }
        
        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
        navigate("/profile");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgba(255,243,240,1)] flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-[#6153BD] font-bold mb-8 hover:text-[#6153BD]/90 transition-colors w-fit ml-4"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Home
      </button>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-[20px] shadow-lg">
          <div>
            <div className="flex items-center justify-center">
              <img
                loading="lazy"
                srcSet="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/fc1f6b1b3fc6ee87b690f1b6be44876cdf1e0e313d0c5d6607e5e53302011af2?placeholderIfAbsent=true&width=100 100w, https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/fc1f6b1b3fc6ee87b690f1b6be44876cdf1e0e313d0c5d6607e5e53302011af2?placeholderIfAbsent=true&width=200 200w"
                className="aspect-[1] object-contain w-[76px]"
                alt="HelloWorld! Logo"
              />
            </div>
            <div className="text-center">
              <h1 className="text-[rgba(97,83,189,1)] text-4xl font-black leading-none">
                HelloWorld!
              </h1>
              <p className="text-[rgba(255,106,72,1)] text-base font-bold">
                The world in one place
              </p>
            </div>
            <h2 className="mt-6 text-center text-3xl font-black text-[#6153BD]">
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-t-[10px] relative block w-full px-3 py-2 border-2 border-[rgba(18,0,113,1)] placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#6153BD] focus:border-[#6153BD] focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-b-[10px] relative block w-full px-3 py-2 border-2 border-[rgba(18,0,113,1)] placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#6153BD] focus:border-[#6153BD] focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-5 border-2 text-base font-bold rounded-[10px] text-white bg-[#6153BD] border-[rgba(18,0,113,1)] transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[rgba(97,83,189,0.9)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6153BD]"
              >
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-base font-bold text-[#6153BD] hover:text-[#6153BD]/90"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "No account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
