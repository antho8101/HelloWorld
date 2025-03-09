
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOnlineStatus = (userId: string | null) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!userId) {
      setIsOnline(false);
      return;
    }

    // Get current state to initialize
    const checkInitialState = async () => {
      try {
        const channel = supabase.channel('online-users');
        const state = channel.presenceState();
        
        // Check if this user ID exists in any of the presence entries
        const userIsOnline = Object.values(state).some(
          presence => (presence as any[]).some(p => p.user_id === userId)
        );
        
        setIsOnline(userIsOnline);
      } catch (error) {
        console.error("Error checking initial online state:", error);
      }
    };
    
    checkInitialState();

    // Subscribe to presence events to track online status
    const channel = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const userIsOnline = Object.values(state).some(
          presence => (presence as any[]).some(p => p.user_id === userId)
        );
        setIsOnline(userIsOnline);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Update own online status
          const currentUserId = (await supabase.auth.getSession()).data.session?.user?.id;
          
          // Only track if we're checking our own status
          if (currentUserId === userId) {
            await channel.track({
              user_id: userId,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      if (channel) {
        channel.untrack();
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  return isOnline;
};
