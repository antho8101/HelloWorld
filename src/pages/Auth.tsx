
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Inscription réussie !",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/profile");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgba(255,243,240,1)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
            {isSignUp ? "Créer un compte" : "Se connecter"}
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
                placeholder="Adresse email"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-b-[10px] relative block w-full px-3 py-2 border-2 border-[rgba(18,0,113,1)] placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#6153BD] focus:border-[#6153BD] focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-5 border-2 text-base font-bold rounded-[10px] text-white bg-[#6153BD] border-[rgba(18,0,113,1)] transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[rgba(97,83,189,0.9)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6153BD]"
            >
              {loading ? "Chargement..." : isSignUp ? "S'inscrire" : "Se connecter"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-base font-bold text-[#6153BD] hover:text-[#6153BD]/90"
          >
            {isSignUp
              ? "Déjà un compte ? Se connecter"
              : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
};
