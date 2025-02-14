
import React, { useState, useEffect } from "react";
import { User } from "@phosphor-icons/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

export const FriendsSection: React.FC = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const params = useParams();

  const loadFriends = async () => {
    if (!params.id) return;

    // Get friends where the current profile is either user_id1 or user_id2
    const { data, error } = await supabase
      .from('friends')
      .select(`
        user_id1,
        user_id2,
        profiles1:profiles!friends_user_id1_fkey (
          id,
          name,
          avatar_url
        ),
        profiles2:profiles!friends_user_id2_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .or(`user_id1.eq.${params.id},user_id2.eq.${params.id}`);

    if (error) {
      console.error('Error loading friends:', error);
      return;
    }

    // Transform the data to get a flat list of friends
    const transformedFriends = data.map(friend => {
      // If user_id1 is the current user, return user_id2's profile, otherwise return user_id1's profile
      return friend.user_id1 === params.id ? friend.profiles2 : friend.profiles1;
    });

    setFriends(transformedFriends);
  };

  useEffect(() => {
    loadFriends();

    // Subscribe to real-time updates for the friends table
    const channel = supabase
      .channel('friends-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friends',
      }, () => {
        loadFriends();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.id]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[20px] p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-[#6153BD]">Friends</h3>
      {friends.length === 0 ? (
        <div className="text-gray-500 text-center">
          No friends yet
        </div>
      ) : (
        <div className="space-y-3">
          {friends.map((friend) => (
            <Link
              key={friend.id}
              to={`/profile/${friend.id}`}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={friend.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{friend.name || "Anonymous"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
