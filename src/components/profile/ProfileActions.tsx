
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
      // Check if conversation exists by looking for a conversation where both users are participants
      const { data: existingConversations, error: queryError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId);

      if (queryError) throw queryError;

      let conversationId = null;

      // If we found conversations where the current user is a participant
      if (existingConversations && existingConversations.length > 0) {
        // For each conversation, check if the other user is also a participant
        for (const conv of existingConversations) {
          const { data: otherParticipant, error: participantError } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('conversation_id', conv.conversation_id)
            .eq('user_id', profileId)
            .maybeSingle();
          
          if (participantError) throw participantError;
          
          // If we found a match, this is the conversation between the two users
          if (otherParticipant) {
            conversationId = conv.conversation_id;
            break;
          }
        }
      }

      // If no existing conversation was found, create a new one
      if (!conversationId) {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createError) throw createError;
        
        conversationId = newConversation.id;
        
        // Add both users as participants
        const { error: participantError1 } = await supabase
          .from('conversation_participants')
          .insert({
            conversation_id: conversationId,
            user_id: currentUserId
          });
          
        if (participantError1) throw participantError1;
        
        const { error: participantError2 } = await supabase
          .from('conversation_participants')
          .insert({
            conversation_id: conversationId,
            user_id: profileId
          });
          
        if (participantError2) throw participantError2;
      }

      // Navigate to messages with the conversation ID
      navigate('/messages', { state: { conversationId } });
    } catch (error) {
      console.error('Error handling message action:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start conversation. Please try again later.",
      });
    }

    // Still call the original onMessage function for backward compatibility
    onMessage();
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
