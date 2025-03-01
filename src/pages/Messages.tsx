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
  Flag,
  Chats
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
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

// Définir une interface pour les participants des conversations
interface ConversationParticipant {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

// Définir une interface pour les conversations
interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  is_archived: boolean;
  otherParticipant: ConversationParticipant | null;
  isTemporary?: boolean;
}

export const Messages = () => {
  const location = useLocation();
  const { currentUserId } = useSession();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [tempConversation, setTempConversation] = useState<any>(null);
  const [showNewConversationBanner, setShowNewConversationBanner] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  // Define the profileId variable based on the selectedUserId
  const [profileId, setProfileId] = useState<string | null>(null);

  // Use useEffect to set profileId when selectedUserId changes
  useEffect(() => {
    setProfileId(selectedUserId);
  }, [selectedUserId]);

  // Récupérer les informations de la conversation temporaire du localStorage
  useEffect(() => {
    const storedConversation = localStorage.getItem('currentConversation');
    if (storedConversation) {
      try {
        const parsedConversation = JSON.parse(storedConversation);
        setTempConversation(parsedConversation);
      } catch (e) {
        console.error("Error parsing stored conversation:", e);
      }
    }
  }, []);

  useEffect(() => {
    // Check if we have a conversationId from navigation state
    const stateConversationId = location.state?.conversationId;
    const stateOtherUserId = location.state?.otherUserId;
    
    if (stateConversationId) {
      setCurrentConversationId(stateConversationId);
      
      if (stateOtherUserId) {
        setSelectedUserId(stateOtherUserId);
      }
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

      if (participationError) {
        console.error('Error fetching participations:', participationError);
        return;
      }
      
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

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        return;
      }
      
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

          let otherParticipant: ConversationParticipant | null = null;
          
          if (otherParticipants && otherParticipants.length > 0) {
            const participant = otherParticipants[0];
            
            // First check if participant exists and has user_id
            if (participant && participant.user_id) {
              // If we at least have a user_id, create a minimal participant
              otherParticipant = {
                id: participant.user_id,
                name: null,
                avatar_url: null
              };
              
              // Then, if profiles data is available, enhance the participant with that data
              if (participant.profiles) {
                // Need an additional null check to satisfy TypeScript
                const profiles = participant.profiles;
                
                if (profiles && typeof profiles === 'object' && !('error' in profiles)) {
                  // Make sure profile values are not null before accessing them
                  const profileId = profiles.id;
                  const profileName = profiles.name;
                  const profileAvatar = profiles.avatar_url;
                  
                  otherParticipant = {
                    id: typeof profileId === 'string' ? profileId : String(profileId || participant.user_id),
                    name: profileName || null,
                    avatar_url: profileAvatar || null
                  };
                }
              }
            }
          }

          const result: Conversation = {
            ...conversation,
            otherParticipant
          };

          return result;
        })
      );
      
      // Si nous avons une conversation temporaire, l'ajouter à la liste
      let allConversations: Conversation[] = [...conversationsWithParticipants];
      
      if (tempConversation && tempConversation.participants) {
        const otherParticipantId = tempConversation.participants.find(
          (p: any) => p && p.id !== currentUserId
        )?.id;
        
        if (otherParticipantId) {
          // Create a temporary conversation with the correct type
          const tempConversationItem: Conversation = {
            id: tempConversation.id || `temp-${Date.now()}`,
            created_at: new Date(tempConversation.timestamp || Date.now()).toISOString(),
            updated_at: new Date(tempConversation.timestamp || Date.now()).toISOString(),
            is_pinned: false,
            is_archived: false,
            otherParticipant: {
              id: otherParticipantId,
              name: "Conversation partner",
              avatar_url: null
            },
            isTemporary: true
          };
          
          allConversations.unshift(tempConversationItem);
        }
      }
      
      setConversations(allConversations);
      
      // Si nous avons un ID de conversation de navigation, le sélectionner
      if (location.state?.conversationId && allConversations.length) {
        setCurrentConversationId(location.state.conversationId);
      } else if (allConversations.length) {
        // Sinon, sélectionner la première conversation
        setCurrentConversationId(allConversations[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchPosts = async () => {
    if (profileId) {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (
            id,
            name,
            username,
            avatar_url
          )
        `)
        .eq("user_id", profileId)
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error fetching posts:", postsError);
        return;
      }

      if (currentUserId) {
        const { data: likedPosts } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", currentUserId);

        const likedPostIds = new Set(likedPosts?.map(like => like.post_id) || []);

        const postsWithLikes = await Promise.all(
          postsData.map(async (post) => {
            const { data: comments, error: commentsError } = await supabase
              .from("comments")
              .select(`
                id,
                content,
                created_at,
                profiles (
                  name,
                  username,
                  avatar_url
                )
              `)
              .eq("post_id", post.id)
              .order("created_at", { ascending: true });

            if (commentsError) {
              console.error("Error fetching comments:", commentsError);
              return {
                ...post,
                isLiked: likedPostIds.has(post.id),
                comments: [],
              };
            }

            return {
              ...post,
              isLiked: likedPostIds.has(post.id),
              comments: comments?.map(comment => {
                // Add null checking for profiles
                const profileData = comment.profiles || { name: null, username: null, avatar_url: null };
              
                return {
                  id: comment.id,
                  content: comment.content,
                  createdAt: comment.created_at,
                  author: {
                    name: profileData.name || "Unknown User",
                    username: profileData.username || "unknown",
                    avatarUrl: profileData.avatar_url || null,
                  },
                  likesCount: 0,
                  isLiked: false,
                };
              }) || [],
            };
          })
        );

        setPosts(postsWithLikes);
      }
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && currentConversationId) {
      console.log("Sending message:", message, "to conversation:", currentConversationId);
      
      // Masquer le bandeau de nouvelle conversation après l'envoi du premier message
      setShowNewConversationBanner(false);
      
      // Pour cette version simplifiée, nous n'enregistrons pas réellement le message en base de données
      // mais affichons simplement une notification
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      
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

  // Vérifier si la conversation actuelle est une nouvelle conversation temporaire
  const isNewTemporaryConversation = (): boolean => {
    if (!currentConversationId || !tempConversation) return false;
    return currentConversationId === (tempConversation.id || `temp-${Date.now()}`);
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
                  {conversations.length > 0 ? (
                    conversations.map((convo, i) => {
                      const userId = convo.otherParticipant?.id || `user${i}`;
                      const isOnline = mockOnlineStatus(userId);
                      
                      return (
                        <div
                          key={convo.id}
                          className={`p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors relative ${
                            currentConversationId === convo.id ? 'bg-gray-100' : ''
                          }`}
                          onClick={() => {
                            setCurrentConversationId(convo.id);
                            setSelectedUserId(userId);
                            // Réinitialiser le bandeau si nécessaire
                            if (convo.isTemporary) {
                              setShowNewConversationBanner(true);
                            }
                          }}
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
                              <p className="font-medium">{convo.otherParticipant?.name || `User ${i+1}`}</p>
                              <p className="text-sm text-gray-500 truncate">
                                {convo.isTemporary ? "New conversation" : "Last message preview..."}
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
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No conversations yet
                    </div>
                  )}
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
                  <h2 className="text-lg font-semibold">
                    {selectedUserId ? "Chat with User" : "Select a conversation"}
                  </h2>
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

              {/* New Conversation Banner */}
              {tempConversation && 
               currentConversationId === tempConversation.id && 
               showNewConversationBanner && (
                <div className="bg-blue-50 p-4 border-b border-blue-100">
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <Chats size={20} weight="fill" />
                    <p className="text-center font-medium">
                      This is the beginning of your conversation. Your messages will be saved when you send your first message.
                    </p>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentConversationId ? (
                    tempConversation && currentConversationId === tempConversation.id ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500 max-w-md">
                          <ChatCircle size={64} weight="light" className="mx-auto mb-4 text-[#6153BD]" />
                          <h3 className="text-lg font-medium text-[#6153BD] mb-2">Start a new conversation</h3>
                          <p>Type your first message below to start chatting with this person. Your conversation will begin once you send your first message.</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Sample messages for existing conversations */}
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
                      </>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <ChatCircle size={48} weight="light" className="mx-auto mb-2 text-gray-400" />
                        <p>Select a conversation to start messaging</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              {currentConversationId && (
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
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
