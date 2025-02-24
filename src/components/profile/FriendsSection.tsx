
import React, { useState, useEffect } from "react";
import { User, X } from "@phosphor-icons/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export const FriendsSection: React.FC = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [showAllFriends, setShowAllFriends] = useState(false);
  const params = useParams();
  const { currentUserId } = useSession();
  const isOwnProfile = currentUserId === params.id;

  const loadFriends = async () => {
    if (!params.id) return;

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

    const transformedFriends = data.map(friend => {
      return friend.user_id1 === params.id ? friend.profiles2 : friend.profiles1;
    });

    setFriends(transformedFriends);
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`user_id1.eq.${currentUserId}.and.user_id2.eq.${friendId},user_id1.eq.${friendId}.and.user_id2.eq.${currentUserId}`);

      if (error) throw error;

      toast.success("Friend removed successfully");
      loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error("Failed to remove friend");
    }
  };

  useEffect(() => {
    loadFriends();

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

  const visibleFriends = showAllFriends ? friends : friends.slice(0, 6);

  const FriendCard = ({ friend }: { friend: any }) => {
    const isOnline = useOnlineStatus(friend.id);
    
    return (
      <div className="relative">
        <Link
          to={`/profile/${friend.id}`}
          className="flex flex-col items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={friend.avatar_url || undefined} />
              <AvatarFallback>
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div 
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          </div>
          <p className="mt-2 text-sm font-medium text-gray-900 text-center">
            {friend.name || "Anonymous"}
          </p>
        </Link>
        {isOwnProfile && (
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRemoveFriend(friend.id);
            }}
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200 p-1"
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[20px] p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-[#6153BD]">Friends</h3>
      {friends.length === 0 ? (
        <div className="text-gray-500 text-center">
          No friends yet
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {visibleFriends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
          {friends.length > 6 && (
            <Button
              onClick={() => setShowAllFriends(true)}
              variant="outline"
              className="w-full bg-white gap-2.5 text-[#6153BD] whitespace-nowrap px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#6153BD] hover:text-white"
            >
              See all friends ({friends.length})
            </Button>
          )}
        </>
      )}

      <Dialog open={showAllFriends} onOpenChange={setShowAllFriends}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>All Friends ({friends.length})</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 mt-4 max-h-[60vh] overflow-y-auto p-4">
            {friends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
