
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlobeIcon } from "lucide-react";
import { UserCircle, ChatCircleDots, MagnifyingGlass, Gear } from "@phosphor-icons/react";

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

  const handleProfileClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  return (
    <header className="flex w-full items-center justify-between flex-wrap p-10 max-md:max-w-full bg-[#FFF3F0]">
      <div className="flex items-center gap-4">
        <div 
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img
            loading="lazy"
            srcSet="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/fc1f6b1b3fc6ee87b690f1b6be44876cdf1e0e313d0c5d6607e5e53302011af2?placeholderIfAbsent=true&width=100 100w, https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/fc1f6b1b3fc6ee87b690f1b6be44876cdf1e0e313d0c5d6607e5e53302011af2?placeholderIfAbsent=true&width=200 200w"
            className="aspect-[1] object-contain w-[76px] shrink-0"
            alt="HelloWorld! Logo"
          />
          <div className="flex flex-col justify-center">
            <div className="text-[rgba(97,83,189,1)] text-4xl font-black leading-none">
              HelloWorld!
            </div>
            <div className="text-[rgba(255,106,72,1)] text-base font-bold">
              The world in one place
            </div>
          </div>
        </div>

        {isLoggedIn && (
          <div className="flex items-center gap-4 ml-8">
            <button 
              onClick={handleProfileClick}
              className="flex items-center gap-2 text-[#6153BD] hover:text-[#4B3FA0] transition-colors"
              title="My Profile"
            >
              <UserCircle size={24} weight="bold" />
              <span className="hidden md:inline">My Profile</span>
            </button>
            
            <button 
              onClick={() => navigate("/messages")}
              className="flex items-center gap-2 text-[#6153BD] hover:text-[#4B3FA0] transition-colors relative"
              title="Messages"
            >
              <ChatCircleDots size={24} weight="bold" />
              <span className="hidden md:inline">Messages</span>
              {unreadMessages > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FF6A48] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  +{unreadMessages}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => navigate("/search")}
              className="flex items-center gap-2 text-[#6153BD] hover:text-[#4B3FA0] transition-colors"
              title="Search"
            >
              <MagnifyingGlass size={24} weight="bold" />
              <span className="hidden md:inline">Search</span>
            </button>
            
            <button 
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2 text-[#6153BD] hover:text-[#4B3FA0] transition-colors"
              title="Settings"
            >
              <Gear size={24} weight="bold" />
              <span className="hidden md:inline">Settings</span>
            </button>
          </div>
        )}
      </div>

      <nav className={`flex items-center gap-5 text-base font-bold my-auto transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
        <Select defaultValue="en">
          <SelectTrigger className="w-[140px] h-[42px] text-[#FF6A48] border-2 border-[#FF6A48] font-medium flex items-center gap-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md rounded-[10px]">
            <GlobeIcon className="h-5 w-5" />
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="zh">中文</SelectItem>
            <SelectItem value="ar">العربية</SelectItem>
          </SelectContent>
        </Select>
        
        {!isLoggedIn ? (
          <>
            <button 
              onClick={() => navigate("/auth?mode=signup")}
              disabled={isTransitioning}
              className="bg-[rgba(97,83,189,1)] flex items-center gap-2.5 text-white justify-center px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[rgba(97,83,189,0.9)] disabled:opacity-50"
            >
              <span>Get started</span>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/6f00598569306f4eed36007bf36924a551566ffaca4cf8d159b94c54cd033c0b?placeholderIfAbsent=true"
                className="aspect-[1] object-contain w-[21px]"
                alt=""
              />
            </button>
            <button 
              onClick={() => navigate("/auth")}
              disabled={isTransitioning}
              className="bg-white gap-2.5 text-[#6153BD] whitespace-nowrap px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#6153BD] hover:text-white disabled:opacity-50"
            >
              Login
            </button>
          </>
        ) : (
          <button 
            onClick={handleLogout}
            disabled={isTransitioning}
            className="bg-white gap-2.5 text-[#6153BD] whitespace-nowrap px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#6153BD] hover:text-white disabled:opacity-50"
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  );
};
