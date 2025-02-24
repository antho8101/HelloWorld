
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChatText, UserPlus } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileActionsProps {
  onMessage: () => void;
  profileId: string;
  currentUserId: string | null;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  onMessage,
  profileId,
  currentUserId,
}) => {
  const { toast } = useToast();
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    if (currentUserId) {
      checkAttemptsCount();
      checkFriendshipStatus();
    }
  }, [currentUserId, profileId]);

  const checkFriendshipStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select()
        .or(`user_id1.eq.${currentUserId}.and.user_id2.eq.${profileId},user_id1.eq.${profileId}.and.user_id2.eq.${currentUserId}`)
        .maybeSingle();

      if (error) throw error;
      setIsFriend(!!data);
    } catch (error) {
      console.error('Error checking friendship status:', error);
    }
  };

  const checkAttemptsCount = async () => {
    try {
      const { data, error } = await supabase
        .rpc('check_friend_request_attempts', {
          sender: currentUserId,
          receiver: profileId
        });

      if (error) throw error;
      setAttemptsCount(data || 0);
    } catch (error) {
      console.error('Error checking friend request attempts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!currentUserId) {
      toast({
        variant: "destructive",
        title: "Cannot Send Friend Request",
        description: "You must be logged in to add friends. Please sign in and try again.",
      });
      return;
    }

    if (attemptsCount >= 3) {
      toast({
        variant: "destructive",
        title: "Maximum Attempts Reached",
        description: "You have reached the maximum number of friend request attempts for this user.",
      });
      return;
    }

    try {
      const { data: existingRequest } = await supabase
        .from('friend_requests')
        .select('status, attempt_count')
        .eq('sender_id', currentUserId)
        .eq('receiver_id', profileId)
        .maybeSingle();

      const newAttemptCount = (existingRequest?.attempt_count || 0) + 1;

      const { error } = await supabase
        .from('friend_requests')
        .upsert({
          sender_id: currentUserId,
          receiver_id: profileId,
          status: 'pending',
          attempt_count: newAttemptCount
        }, {
          onConflict: 'sender_id,receiver_id'
        });

      if (error) {
        throw error;
      }

      setAttemptsCount(newAttemptCount);
      
      toast({
        title: "Friend Request Sent! 🎉",
        description: `Your friend request has been sent successfully. You have ${3 - newAttemptCount} attempts remaining.`,
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        variant: "destructive",
        title: "Failed to Send Friend Request",
        description: "There was an error sending your friend request. Please try again later.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Button 
        onClick={onMessage}
        className="bg-[rgba(97,83,189,1)] flex items-center gap-2.5 text-white justify-center px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[rgba(97,83,189,0.9)] w-full"
      >
        <ChatText size={20} weight="bold" />
        Send Message
      </Button>
      {!isFriend && (
        <Button 
          onClick={handleAddFriend}
          disabled={isLoading || attemptsCount >= 3}
          className="bg-white gap-2.5 text-[#6153BD] whitespace-nowrap px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#6153BD] hover:text-white w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus size={20} weight="bold" />
          {attemptsCount >= 3 ? 'Maximum Attempts Reached' : 'Add Friend'}
        </Button>
      )}
    </div>
  );
};
