
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "./Logo";
import { UserNavigation } from "./UserNavigation";
import { AuthButtons } from "./AuthButtons";
import { LanguageSelector } from "./LanguageSelector";
import { useNavigate } from "react-router-dom";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setIsTransitioning(true);
          setTimeout(() => {
            if (mounted) {
              setIsLoggedIn(!!session);
              setUserId(session?.user?.id || null);
              setIsTransitioning(false);
            }
          }, 0);
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsTransitioning(true);
        setTimeout(() => {
          if (mounted) {
            setIsLoggedIn(!!session);
            setUserId(session?.user?.id || null);
            setIsTransitioning(false);
          }
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsTransitioning(true);
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsTransitioning(false);
    }
  };

  return (
    <header className="flex w-full items-center justify-between flex-wrap px-5 py-2.5 max-md:max-w-full bg-[#FFF3F0]">
      <div className="flex items-center gap-4">
        <Logo />
        {isLoggedIn && <UserNavigation userId={userId} unreadMessages={unreadMessages} />}
      </div>

      <nav className={`flex items-center gap-5 text-base font-bold my-auto transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
        <LanguageSelector />
        <AuthButtons 
          isLoggedIn={isLoggedIn}
          isTransitioning={isTransitioning}
          onLogout={handleLogout}
        />
      </nav>
    </header>
  );
};
