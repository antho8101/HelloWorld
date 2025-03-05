
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChatText, UserPlus } from "@phosphor-icons/react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  checkFriendRequestAttempts,
  checkFriendshipStatus,
  sendFriendRequest
} from "@/services/friendRequestService";
import { handleMessageAction } from "@/services/profileMessagingService";

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
  const navigate = useNavigate();
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  useEffect(() => {
    if (currentUserId) {
      loadInitialData();
    }
  }, [currentUserId, profileId]);

  const loadInitialData = async () => {
    if (!currentUserId || !profileId) return;
    
    const [friendshipStatus, attempts] = await Promise.all([
      checkFriendshipStatus(currentUserId, profileId),
      checkFriendRequestAttempts(currentUserId, profileId)
    ]);
    
    setIsFriend(friendshipStatus);
    setAttemptsCount(attempts);
    setIsLoading(false);
  };

  const handleMessageClick = async () => {
    if (!currentUserId) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You need to be logged in to send messages.",
      });
      return;
    }

    try {
      setIsMessageLoading(true);
      
      // Direct navigation to messages page with state
      navigate('/messages', { 
        state: { 
          otherUserId: profileId
        }
      });
      
      // Call handleMessageAction in background to create/fetch conversation
      handleMessageAction(currentUserId, profileId, onMessage)
        .catch(error => {
          console.error('Background conversation creation error:', error);
        });
    } catch (error) {
      console.error('Error handling message action:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to navigate to messages. Please try again later.",
      });
    } finally {
      setIsMessageLoading(false);
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
      const { success, newAttemptCount } = await sendFriendRequest(currentUserId, profileId);
      
      if (success) {
        setAttemptsCount(newAttemptCount);
        toast({
          title: "Friend Request Sent! 🎉",
          description: `Your friend request has been sent successfully. You have ${3 - newAttemptCount} attempts remaining.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Send Friend Request",
          description: "There was an error sending your friend request. Please try again later.",
        });
      }
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
        onClick={handleMessageClick}
        disabled={isMessageLoading}
        className="bg-[rgba(97,83,189,1)] flex items-center gap-2.5 text-white justify-center px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[rgba(97,83,189,0.9)] w-full"
      >
        <ChatText size={20} weight="bold" />
        {isMessageLoading ? "Loading..." : "Send Message"}
      </Button>
      {!isFriend && !isLoading && (
        <Button 
          onClick={handleAddFriend}
          disabled={attemptsCount >= 3}
          className="bg-white gap-2.5 text-[#6153BD] whitespace-nowrap px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#6153BD] hover:text-white w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus size={20} weight="bold" />
          {attemptsCount >= 3 ? 'Maximum Attempts Reached' : 'Add Friend'}
        </Button>
      )}
    </div>
  );
};
