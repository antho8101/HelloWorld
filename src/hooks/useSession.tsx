
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSession = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        setAuthLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUserId(session.user.id);
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
      } finally {
        setAuthLoading(false);
      }
    };
    checkUser();
  }, []);

  return { currentUserId, authLoading };
};
