
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

// Définir une interface pour les messages
interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender_name?: string | null;
  sender_avatar?: string | null;
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
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [tempConversation, setTempConversation] = useState<any>(null);
  const [showNewConversationBanner, setShowNewConversationBanner] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  // Effect pour scroller vers le bas lorsque de nouveaux messages sont chargés
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

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

  // Fetch messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      fetchMessages(currentConversationId);
    }
  }, [currentConversationId]);

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
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

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
      
      setConversations(conversationsWithParticipants);
      
      // Si nous avons un ID de conversation de navigation, le sélectionner
      if (location.state?.conversationId && conversationsWithParticipants.length) {
        setCurrentConversationId(location.state.conversationId);
        // Supprimer les conversations temporaires du localStorage une fois qu'on a trouvé une conversation réelle
        localStorage.removeItem('currentConversation');
      } else if (conversationsWithParticipants.length) {
        // Sinon, sélectionner la première conversation
        setCurrentConversationId(conversationsWithParticipants[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!conversationId) return;
    
    setIsLoadingMessages(true);
    
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles:sender_id(
            name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        setCurrentMessages([]);
        return;
      }
      
      // Format messages with profile data
      const formattedMessages = messagesData?.map(msg => {
        // Add proper null checking for profiles
        const profileData = msg.profiles ? 
          // Check if profiles is an error or an object with data
          ('error' in msg.profiles ? { name: null, avatar_url: null } : msg.profiles)
          : { name: null, avatar_url: null };
        
        return {
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          sender_id: msg.sender_id,
          sender_name: profileData.name,
          sender_avatar: profileData.avatar_url
        };
      }) || [];
      
      setCurrentMessages(formattedMessages);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      setCurrentMessages([]);
    } finally {
      setIsLoadingMessages(false);
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
                // Add proper null checking for profiles
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

  const handleSendMessage = async () => {
    if (message.trim() && currentConversationId && currentUserId) {
      try {
        // Insert the message into the database
        const { data, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: currentConversationId,
            sender_id: currentUserId,
            content: message.trim()
          })
          .select();
          
        if (error) {
          console.error('Error sending message:', error);
          toast({
            variant: "destructive",
            title: "Failed to Send",
            description: "There was an error sending your message. Please try again."
          });
          return;
        }
        
        // Fetch the latest messages to update the UI
        fetchMessages(currentConversationId);
        
        // Masquer le bandeau de nouvelle conversation après l'envoi du premier message
        setShowNewConversationBanner(false);
        
        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully.",
        });
        
        setMessage("");
      } catch (error) {
        console.error('Error in handleSendMessage:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong. Please try again later."
        });
      }
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
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="w-10 h-10 bg-[#6153BD]/10 rounded-full flex items-center justify-center">
                                {convo.otherParticipant?.avatar_url ? (
                                  <img 
                                    src={convo.otherParticipant.avatar_url} 
                                    alt="Profile" 
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <ChatCircle size={20} weight="fill" className="text-[#6153BD]" />
                                )}
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
                                {convo.isTemporary ? "New conversation" : "Click to view messages"}
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
                    {selectedUserId ? 
                      conversations.find(c => c.id === currentConversationId)?.otherParticipant?.name || "Chat" 
                      : "Select a conversation"}
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
              {currentConversationId && currentMessages.length === 0 && showNewConversationBanner && (
                <div className="bg-blue-50 p-4 border-b border-blue-100">
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <Chats size={20} weight="fill" />
                    <p className="text-center font-medium">
                      This is the beginning of your conversation. Send a message to start chatting.
                    </p>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentConversationId ? (
                    isLoadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Loading messages...</p>
                      </div>
                    ) : currentMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500 max-w-md">
                          <ChatCircle size={64} weight="light" className="mx-auto mb-4 text-[#6153BD]" />
                          <h3 className="text-lg font-medium text-[#6153BD] mb-2">Start a new conversation</h3>
                          <p>Type your first message below to start chatting with this person.</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Display actual messages */}
                        {currentMessages.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`p-3 rounded-lg max-w-[70%] ${
                                msg.sender_id === currentUserId 
                                  ? 'bg-[#6153BD] text-white' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {/* This div allows us to scroll to the bottom of the messages */}
                        <div ref={messagesEndRef} />
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
