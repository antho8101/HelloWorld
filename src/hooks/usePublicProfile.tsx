
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePublicProfile = (profile: any, currentUserId: string | null) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUserId) {
      fetchFriendRequests();
    }
  }, [currentUserId]);

  const fetchFriendRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          id,
          created_at,
          sender:sender_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('receiver_id', currentUserId)
        .eq('status', 'pending');

      if (error) throw error;
      setFriendRequests(data || []);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleMessage = async () => {
    if (!currentUserId) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You need to be logged in to send messages.",
      });
      return;
    }
    
    // The actual functionality is now handled in the ProfileActions component
    console.log("Message action initiated for user:", profile?.id);
  };

  const handleReport = async () => {
    if (!reportReason) {
      toast({
        title: "Error",
        description: "Please select a reason for reporting",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error: reportError } = await supabase
        .from("reports")
        .insert({
          reporter_id: currentUserId,
          reported_user_id: profile?.id,
          reason: reportReason,
          description: reportDescription,
        });

      if (reportError) throw reportError;

      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe.",
      });
      
      setIsReportModalOpen(false);
      setReportReason("");
      setReportDescription("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    isReportModalOpen,
    setIsReportModalOpen,
    reportReason,
    setReportReason,
    reportDescription,
    setReportDescription,
    friendRequests,
    fetchFriendRequests,
    handleMessage,
    handleReport,
  };
};
