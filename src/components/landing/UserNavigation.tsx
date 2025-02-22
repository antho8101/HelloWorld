
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle, ChatCircleDots, MagnifyingGlass, Gear } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";

interface UserNavigationProps {
  userId: string | null;
  unreadMessages: number;
}

export const UserNavigation: React.FC<UserNavigationProps> = ({ userId, unreadMessages }) => {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState(0);
  
  useEffect(() => {
    if (!userId) return;

    const fetchPendingRequests = async () => {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('id')
        .eq('receiver_id', userId)
        .eq('status', 'pending');

      if (!error && data) {
        setPendingRequests(data.length);
      }
    };

    fetchPendingRequests();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('friend-requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friend_requests',
        filter: `receiver_id=eq.${userId}`,
      }, () => {
        fetchPendingRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleNavigation = (route: string) => {
    try {
      if (!userId) {
        navigate("/login");
        return;
      }

      switch (route) {
        case "profile":
          navigate(`/profile/${encodeURIComponent(userId)}`);
          break;
        case "messages":
          navigate("/messages");
          break;
        case "search":
          navigate("/search");
          break;
        case "settings":
          navigate("/settings");
          break;
        default:
          console.error("Invalid route");
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };
  
  return (
    <div className="flex items-center gap-4 ml-8">
      <button 
        onClick={() => handleNavigation("profile")}
        className="flex items-center gap-2 text-[#6153BD] hover:text-[#4B3FA0] transition-colors relative"
        title="My Profile"
      >
        <UserCircle size={24} weight="bold" />
        <span className="hidden md:inline">My Profile</span>
        {pendingRequests > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {pendingRequests}
          </span>
        )}
      </button>
      
      <button 
        onClick={() => handleNavigation("messages")}
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
        onClick={() => handleNavigation("search")}
        className="flex items-center gap-2 text-[#6153BD] hover:text-[#4B3FA0] transition-colors"
        title="Search"
      >
        <MagnifyingGlass size={24} weight="bold" />
        <span className="hidden md:inline">Search</span>
      </button>
      
      <button 
        onClick={() => handleNavigation("settings")}
        className="flex items-center gap-2 text-[#6153BD] hover:text-[#4B3FA0] transition-colors"
        title="Settings"
      >
        <Gear size={24} weight="bold" />
        <span className="hidden md:inline">Settings</span>
      </button>
    </div>
  );
};
