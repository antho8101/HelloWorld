
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChatText, UserPlus } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    if (currentUserId) {
      checkAttemptsCount();
      checkFriendshipStatus();
    }
  }, [currentUserId, profileId]);

  const checkFriendshipStatus = async () => {
    if (!currentUserId || !profileId) return;
    
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id1.eq.${currentUserId},user_id2.eq.${currentUserId}`)
        .or(`user_id1.eq.${profileId},user_id2.eq.${profileId}`);

      if (error) throw error;

      const isFriendFound = data?.some(friendship => 
        (friendship.user_id1 === currentUserId && friendship.user_id2 === profileId) ||
        (friendship.user_id1 === profileId && friendship.user_id2 === currentUserId)
      );

      setIsFriend(isFriendFound);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking friendship status:', error);
      setIsLoading(false);
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
    }
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
      console.log("Message action initiated for user:", profileId);
      
      // First, search for existing conversation between the two users
      // Get conversations where current user is a participant
      const { data: myParticipations, error: myParticipationsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId);
      
      if (myParticipationsError) throw myParticipationsError;
      if (!myParticipations || myParticipations.length === 0) {
        // No conversations for current user, create new one
        return createNewConversation();
      }
      
      // Check if the other user is in any of these conversations
      const conversationIds = myParticipations.map(p => p.conversation_id);
      
      const { data: otherUserParticipations, error: otherUserError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', profileId)
        .in('conversation_id', conversationIds);
      
      if (otherUserError) throw otherUserError;
      
      if (otherUserParticipations && otherUserParticipations.length > 0) {
        // Found an existing conversation with both users
        const conversationId = otherUserParticipations[0].conversation_id;
        navigate('/messages', { state: { conversationId } });
        onMessage(); // Call the original onMessage function
        return;
      }
      
      // No common conversation found, create a new one
      await createNewConversation();
      
    } catch (error) {
      console.error('Error handling message action:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start conversation. Please try again later.",
      });
    }
  };
  
  const createNewConversation = async () => {
    try {
      // Using RPC function to avoid row-level security issues
      const { data: conversationData, error: conversationError } = await supabase
        .rpc('create_conversation_with_participants', {
          user_id1: currentUserId,
          user_id2: profileId
        });
      
      if (conversationError) throw conversationError;
      
      // If successful, navigate to the messages page
      if (conversationData) {
        navigate('/messages', { state: { conversationId: conversationData } });
        onMessage(); // Call the original onMessage function
      } else {
        throw new Error("Failed to create conversation");
      }
    } catch (error) {
      // If the RPC function doesn't exist, we'll fall back to an alternative approach
      console.error("Error in createNewConversation:", error);
      
      try {
        // Alternative: create conversation and add participants
        // First create conversation
        const { data: conversation, error: createError } = await supabase
          .from('conversations')
          .insert({})
          .select('id')
          .single();
          
        if (createError) throw createError;
        
        // Add current user as participant
        const { error: user1Error } = await supabase
          .from('conversation_participants')
          .insert({
            conversation_id: conversation.id,
            user_id: currentUserId
          });
          
        if (user1Error) throw user1Error;
        
        // Add other user as participant
        const { error: user2Error } = await supabase
          .from('conversation_participants')
          .insert({
            conversation_id: conversation.id,
            user_id: profileId
          });
          
        if (user2Error) throw user2Error;
        
        // Navigate to messages
        navigate('/messages', { state: { conversationId: conversation.id } });
        onMessage(); // Call the original onMessage function
        
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create conversation. Please try again later.",
        });
      }
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
        onClick={handleMessageClick}
        className="bg-[rgba(97,83,189,1)] flex items-center gap-2.5 text-white justify-center px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[rgba(97,83,189,0.9)] w-full"
      >
        <ChatText size={20} weight="bold" />
        Send Message
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
