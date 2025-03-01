
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
  const [isMessageLoading, setIsMessageLoading] = useState(false);

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
      setIsMessageLoading(true);
      
      // Check if a conversation already exists between these two users
      const { data: existingParticipations, error: participationsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId);
      
      if (participationsError) throw participationsError;
      
      // Get all conversation IDs where the current user is a participant
      const conversationIds = existingParticipations?.map(p => p.conversation_id) || [];
      
      // If there are no conversations, create a new one
      if (conversationIds.length === 0) {
        return await createNewConversation();
      }
      
      // Find conversations where the other user is also a participant
      const { data: otherUserParticipations, error: otherUserError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .in('conversation_id', conversationIds)
        .eq('user_id', profileId);
      
      if (otherUserError) throw otherUserError;
      
      // If there's a common conversation, use that
      if (otherUserParticipations && otherUserParticipations.length > 0) {
        // Use the first existing conversation
        const existingConversationId = otherUserParticipations[0].conversation_id;
        navigateToConversation(existingConversationId);
      } else {
        // Create a new conversation if none exists
        await createNewConversation();
      }
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
  
  const createNewConversation = async () => {
    // 1. Create new conversation
    const { data: newConversation, error: conversationError } = await supabase
      .from('conversations')
      .insert([{ is_pinned: false, is_archived: false }])
      .select()
      .single();
    
    if (conversationError) throw conversationError;
    
    // 2. Add both users as participants
    const participantsToInsert = [
      { conversation_id: newConversation.id, user_id: currentUserId },
      { conversation_id: newConversation.id, user_id: profileId }
    ];
    
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participantsToInsert);
    
    if (participantsError) throw participantsError;
    
    // 3. Navigate to the new conversation
    navigateToConversation(newConversation.id);
  };
  
  const navigateToConversation = (conversationId: string) => {
    // Appliquer l'onMessage callback pour déclencher les changements d'interface
    onMessage();
    
    // Naviguer vers la page de messages
    navigate('/messages', { 
      state: { 
        conversationId: conversationId,
        otherUserId: profileId
      },
      replace: true 
    });
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
