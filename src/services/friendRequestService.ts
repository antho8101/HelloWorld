
import { supabase } from "@/integrations/supabase/client";

export const checkFriendRequestAttempts = async (
  senderId: string | null,
  receiverId: string
): Promise<number> => {
  if (!senderId) return 0;
  
  try {
    const { data, error } = await supabase
      .rpc('check_friend_request_attempts', {
        sender: senderId,
        receiver: receiverId
      });

    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error('Error checking friend request attempts:', error);
    return 0;
  }
};

export const checkFriendshipStatus = async (
  currentUserId: string | null,
  profileId: string
): Promise<boolean> => {
  if (!currentUserId || !profileId) return false;
  
  try {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .or(`user_id1.eq.${currentUserId},user_id2.eq.${currentUserId}`)
      .or(`user_id1.eq.${profileId},user_id2.eq.${profileId}`);

    if (error) throw error;

    return data?.some(friendship => 
      (friendship.user_id1 === currentUserId && friendship.user_id2 === profileId) ||
      (friendship.user_id1 === profileId && friendship.user_id2 === currentUserId)
    ) || false;
  } catch (error) {
    console.error('Error checking friendship status:', error);
    return false;
  }
};

export const sendFriendRequest = async (
  currentUserId: string | null,
  profileId: string
): Promise<{ success: boolean; newAttemptCount: number }> => {
  if (!currentUserId) {
    return { success: false, newAttemptCount: 0 };
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

    return { success: true, newAttemptCount };
  } catch (error) {
    console.error('Error sending friend request:', error);
    return { success: false, newAttemptCount: 0 };
  }
};
