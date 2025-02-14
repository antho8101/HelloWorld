
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOnlineStatus = (userId: string | null) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!userId) {
      setIsOnline(false);
      return;
    }

    const channel = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const userIsOnline = Object.values(presenceState).some(
          presence => (presence as any[]).some(p => p.user_id === userId)
        );
        setIsOnline(userIsOnline);
      })
      .on('presence', { event: 'leave' }, () => {
        setIsOnline(false);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return isOnline;
};
