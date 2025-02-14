
import React, { useState } from "react";
import { CaretDown, CaretUp, X, Check } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@phosphor-icons/react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FriendRequest {
  id: string;
  sender: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
  created_at: string;
}

interface FriendRequestsProps {
  requests: FriendRequest[];
  onRequestHandled: () => void;
}

export const FriendRequests: React.FC<FriendRequestsProps> = ({
  requests,
  onRequestHandled
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { toast } = useToast();

  const handleRequest = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: action })
        .eq('id', requestId);

      if (error) throw error;

      onRequestHandled();
      
      toast({
        title: "Success",
        description: `Friend request ${action}`,
      });
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to handle friend request",
      });
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm rounded-[20px] p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#6153BD] flex items-center gap-2">
          Friend Requests
          <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">
            {requests.length}
          </span>
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-[#6153BD]"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <CaretUp size={20} /> : <CaretDown size={20} />}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={request.sender.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">
                    {request.sender.name || "Anonymous"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-[#6153BD] hover:bg-[#6153BD]/90 text-white"
                  onClick={() => handleRequest(request.id, 'accepted')}
                >
                  <Check size={16} weight="bold" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleRequest(request.id, 'rejected')}
                >
                  <X size={16} weight="bold" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
