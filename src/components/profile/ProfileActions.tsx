
import React from "react";
import { Button } from "@/components/ui/button";
import { ChatText, UserPlus } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const handleAddFriend = async () => {
    if (!currentUserId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to add friends",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: currentUserId,
          receiver_id: profileId,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            variant: "destructive",
            title: "Error",
            description: "Friend request already sent",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Success",
        description: "Friend request sent successfully",
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send friend request",
      });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Button 
        onClick={onMessage}
        className="bg-[rgba(97,83,189,1)] flex items-center gap-2.5 text-white justify-center px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[rgba(97,83,189,0.9)] w-full"
      >
        <ChatText size={20} weight="bold" />
        Send Message
      </Button>
      <Button 
        onClick={handleAddFriend}
        className="bg-white gap-2.5 text-[#6153BD] whitespace-nowrap px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#6153BD] hover:text-white w-full"
      >
        <UserPlus size={20} weight="bold" />
        Add Friend
      </Button>
    </div>
  );
};
