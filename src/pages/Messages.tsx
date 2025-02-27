import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChatCircle, 
  TextBolder, 
  TextItalic, 
  TextUnderline, 
  Palette,
  Image as ImageIcon,
  DotsThree,
  Star,
  UserPlus,
  Trash,
  Prohibit,
  Flag
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

export const Messages = () => {
  const location = useLocation();
  const { currentUserId } = useSession();
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a conversationId from navigation state
    const stateConversationId = location.state?.conversationId;
    if (stateConversationId) {
      setCurrentConversationId(stateConversationId);
    }
    
    if (currentUserId) {
      fetchConversations();
    }
  }, [location, currentUserId]);

  const fetchConversations = async () => {
    if (!currentUserId) return;
    
    try {
      // First get all conversation IDs where the current user is a participant
      const { data: participations, error: participationError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId);

      if (participationError) throw participationError;
      
      if (!participations || participations.length === 0) {
        setConversations([]);
        return;
      }

      // Extract conversation IDs
      const conversationIds = participations.map(p => p.conversation_id);
      
      // Get conversation details
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at,
          is_pinned,
          is_archived
        `)
        .in('id', conversationIds);

      if (conversationsError) throw conversationsError;
      
      // For each conversation, get the other participant
      const conversationsWithParticipants = await Promise.all(
        (conversationsData || []).map(async (conversation) => {
          // Get the other participant in this conversation
          const { data: otherParticipants, error: otherParticipantError } = await supabase
            .from('conversation_participants')
            .select(`
              user_id,
              profiles:user_id(
                id,
                name,
                avatar_url
              )
            `)
            .eq('conversation_id', conversation.id)
            .neq('user_id', currentUserId);

          if (otherParticipantError) {
            console.error('Error fetching other participant:', otherParticipantError);
            return {
              ...conversation,
              otherParticipant: null
            };
          }

          const otherParticipant = otherParticipants && otherParticipants.length > 0 
            ? otherParticipants[0].profiles
            : null;

          return {
            ...conversation,
            otherParticipant
          };
        })
      );
      
      setConversations(conversationsWithParticipants);
      
      // If we have a conversation ID from navigation, select it
      if (location.state?.conversationId && conversationsWithParticipants.length) {
        setCurrentConversationId(location.state.conversationId);
      } else if (conversationsWithParticipants.length) {
        // Otherwise select the first conversation
        setCurrentConversationId(conversationsWithParticipants[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && currentConversationId) {
      console.log("Sending message:", message, "to conversation:", currentConversationId);
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFormatClick = (format: string) => {
    console.log("Applying format:", format);
    // Format implementation will go here
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Image selected:", file);
      // Image upload implementation will go here
    }
  };

  const handleUserAction = (action: string, userId: string) => {
    console.log(`Performing action: ${action} on user: ${userId}`);
    // Implementation for user actions will go here
  };

  // Mock online status for demo purposes - in a real app, this would come from your backend
  const mockOnlineStatus = (userId: string) => {
    const userIds = ["user1", "user3", "user5"];
    return userIds.includes(userId);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[rgba(255,243,240,1)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-200px)] flex">
            {/* Left Column - Conversations List */}
            <div className="w-[300px] border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Messages</h2>
              </div>
              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="p-2 space-y-2">
                  {/* Conversations */}
                  {[1, 2, 3, 4, 5].map((i) => {
                    const userId = `user${i}`;
                    const isOnline = mockOnlineStatus(userId);
                    
                    return (
                      <div
                        key={i}
                        className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors relative"
                        onClick={() => setSelectedUserId(userId)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-[#6153BD]/10 rounded-full flex items-center justify-center">
                              <ChatCircle size={20} weight="fill" className="text-[#6153BD]" />
                            </div>
                            <div 
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                isOnline ? 'bg-green-500' : 'bg-red-500'
                              }`} 
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">User {i}</p>
                            <p className="text-sm text-gray-500 truncate">
                              Last message preview...
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DotsThree size={20} weight="bold" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleUserAction('pin', userId)}>
                                <Star size={16} className="mr-2" /> Pin to favorites
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUserAction('add-friend', userId)}>
                                <UserPlus size={16} className="mr-2" /> Add friend
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUserAction('delete', userId)}>
                                <Trash size={16} className="mr-2" /> Delete conversation
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUserAction('block', userId)}>
                                <Prohibit size={16} className="mr-2" /> Block user
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUserAction('report', userId)}>
                                <Flag size={16} className="mr-2" /> Report user
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Right Column - Conversation */}
            <div className="flex-1 flex flex-col">
              {/* Conversation Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-8 h-8 bg-[#6153BD]/10 rounded-full flex items-center justify-center">
                      <ChatCircle size={16} weight="fill" className="text-[#6153BD]" />
                    </div>
                    <div 
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        selectedUserId && mockOnlineStatus(selectedUserId) ? 'bg-green-500' : 'bg-red-500'
                      }`} 
                    />
                  </div>
                  <h2 className="text-lg font-semibold">Chat with User 1</h2>
                </div>
                {selectedUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <DotsThree size={24} weight="bold" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleUserAction('pin', selectedUserId)}>
                        <Star size={16} className="mr-2" /> Pin to favorites
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction('add-friend', selectedUserId)}>
                        <UserPlus size={16} className="mr-2" /> Add friend
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction('delete', selectedUserId)}>
                        <Trash size={16} className="mr-2" /> Delete conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction('block', selectedUserId)}>
                        <Prohibit size={16} className="mr-2" /> Block user
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction('report', selectedUserId)}>
                        <Flag size={16} className="mr-2" /> Report user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Sample messages */}
                  <div className="flex justify-end">
                    <div className="bg-[#6153BD] text-white rounded-lg p-3 max-w-[70%]">
                      Hello! How are you?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[70%]">
                      I'm doing great, thanks! How about you?
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                {/* Formatting Toolbar */}
                <div className="flex items-center space-x-2 mb-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFormatClick("bold")}
                    className="text-gray-600 hover:text-[#6153BD] hover:bg-[#6153BD]/10"
                  >
                    <TextBolder size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFormatClick("italic")}
                    className="text-gray-600 hover:text-[#6153BD] hover:bg-[#6153BD]/10"
                  >
                    <TextItalic size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFormatClick("underline")}
                    className="text-gray-600 hover:text-[#6153BD] hover:bg-[#6153BD]/10"
                  >
                    <TextUnderline size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFormatClick("color")}
                    className="text-gray-600 hover:text-[#6153BD] hover:bg-[#6153BD]/10"
                  >
                    <Palette size={20} />
                  </Button>
                  <div className="h-5 w-px bg-gray-300 mx-2" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-600 hover:text-[#6153BD] hover:bg-[#6153BD]/10"
                  >
                    <ImageIcon size={20} />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="flex space-x-4">
                  <Textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..." 
                    className="flex-1 min-h-[80px] resize-none"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-[#6153BD] text-white rounded-lg hover:bg-[#6153BD]/90 transition-colors h-fit"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
