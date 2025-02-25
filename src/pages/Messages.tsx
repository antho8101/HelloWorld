
import React, { useEffect, useState } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/layout/Footer";
import { useSession } from "@/hooks/useSession";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PaperPlaneRight, User } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
};

type Conversation = {
  id: string;
  updated_at: string;
  participants: {
    user_id: string;
    profile: {
      name: string;
      avatar_url: string | null;
    };
  }[];
  last_message?: Message;
};

export const Messages = () => {
  const { currentUserId } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation:conversations (
            id,
            updated_at
          ),
          profile:profiles!conversation_participants_user_id_fkey (
            name,
            avatar_url
          )
        `)
        .eq('user_id', currentUserId);

      if (error) throw error;
      
      const formattedData = data.map((item: any) => ({
        id: item.conversation.id,
        updated_at: item.conversation.updated_at,
        participants: [
          {
            user_id: currentUserId,
            profile: item.profile
          }
        ]
      }));

      setConversations(formattedData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: currentUserId,
          content: newMessage
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[rgba(255,243,240,1)] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-[300px,1fr] divide-x divide-gray-200 h-[600px]">
              {/* Conversations List */}
              <div className="overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6153BD]"></div>
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {conversations.map(conversation => {
                      const otherParticipant = conversation.participants.find(
                        p => p.user_id !== currentUserId
                      );
                      
                      return (
                        <button
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation.id)}
                          className={`w-full p-3 rounded-lg flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                            selectedConversation === conversation.id ? 'bg-gray-50' : ''
                          }`}
                        >
                          <Avatar>
                            <AvatarImage src={otherParticipant?.profile.avatar_url || undefined} />
                            <AvatarFallback>
                              <User />
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="font-medium">{otherParticipant?.profile.name}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex flex-col h-full">
                {selectedConversation ? (
                  <>
                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map(message => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`rounded-lg px-4 py-2 max-w-[70%] ${
                              message.sender_id === currentUserId
                                ? 'bg-[#6153BD] text-white'
                                : 'bg-gray-100'
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <form onSubmit={sendMessage} className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          type="submit" 
                          className="bg-[#6153BD] hover:bg-[#6153BD]/90"
                          disabled={!newMessage.trim()}
                        >
                          <PaperPlaneRight size={20} weight="bold" />
                        </Button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Select a conversation to start chatting
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
