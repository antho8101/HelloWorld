
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSession = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }
    };
    checkUser();
  }, []);

  return { currentUserId };
};
