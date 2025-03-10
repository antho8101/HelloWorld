
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Message } from "@/types/messages";
import { updateConversationTimestamp } from "@/services/conversation";

interface MessagePayload {
  content: string;
  conversation_id: string;
  sender_id: string;
}

export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  if (!conversationId) {
    console.warn('fetchMessages called with empty conversationId');
    return [];
  }
  
  try {
    console.log('Fetching messages for conversation:', conversationId);
    
    // Démonstration explicite du problème de RLS - si nous sommes authentifiés
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      console.error('No authenticated session found - this will cause RLS to block access');
    } else {
      console.log('Authenticated as user:', authData.session.user.id);
    }
    
    // Vérifier si l'utilisateur est participant à cette conversation
    const { data: participantData, error: participantError } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", authData.session?.user.id || '');
      
    if (participantError) {
      console.error('Error checking conversation participation:', participantError);
    } else {
      console.log('Participant check result:', participantData);
      if (!participantData || participantData.length === 0) {
        console.warn('Current user is not a participant in this conversation - RLS will block access');
      }
    }
    
    // First, fetch the messages with all needed fields
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select(`
        id,
        content,
        created_at,
        sender_id,
        conversation_id
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      throw messagesError;
    }

    console.log(`Fetched ${messagesData?.length || 0} messages for conversation ${conversationId}:`, messagesData);
    
    if (!messagesData || messagesData.length === 0) {
      console.log(`No messages found for conversation ${conversationId}`);
      
      // Vérifier directement dans la table messages sans RLS pour débogage
      // Cette requête sera bloquée par RLS, mais en mode développement, on peut voir dans les logs
      console.log('Attempting a direct SQL query to check if messages exist');
      const { data: directMessages, error: directError } = await supabase
        .rpc('debug_check_messages_exist', { conversation_id_param: conversationId });
        
      if (directError) {
        console.error('Error checking messages directly:', directError);
      } else {
        console.log('Direct message check result:', directMessages);
      }
      
      return [];
    }
    
    // Get unique sender IDs to fetch their profiles
    const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
    console.log(`Found ${senderIds.length} unique senders:`, senderIds);
    
    // Fetch profiles for all senders in one query
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", senderIds);
      
    if (profilesError) {
      console.error('Error fetching sender profiles:', profilesError);
      // Continue without profile data rather than failing completely
    }
    
    // Create a map for quick profile lookup
    const profilesMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap.set(profile.id, {
          name: profile.name,
          avatar_url: profile.avatar_url
        });
      });
      console.log('Profile data map created:', Object.fromEntries(profilesMap));
    }

    // Map messages with sender data
    const mappedMessages = messagesData.map(msg => {
      const senderProfile = profilesMap.get(msg.sender_id);
      
      return {
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender_name: senderProfile?.name || null,
        sender_avatar: senderProfile?.avatar_url || null
      };
    });
    
    console.log(`Processed ${mappedMessages.length} messages with sender data`);
    return mappedMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    toast.error("Error loading messages");
    return [];
  }
};

export const sendMessage = async (
  messageData: MessagePayload
): Promise<Message | null> => {
  try {
    console.log('Sending message to conversation:', messageData.conversation_id);
    
    const { data, error: messageError } = await supabase
      .from("messages")
      .insert(messageData)
      .select('id, content, created_at, sender_id')
      .single();

    if (messageError) {
      console.error('Error sending message:', messageError);
      throw messageError;
    }

    if (!data) {
      throw new Error('No data returned from message insertion');
    }

    console.log('Message sent successfully to conversation:', messageData.conversation_id);

    // Update the timestamp on the conversation
    await updateConversationTimestamp(messageData.conversation_id);

    // Get sender profile information
    const { data: profileData } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", messageData.sender_id)
      .single();

    // Return the complete message object
    return {
      id: data.id,
      content: data.content,
      created_at: data.created_at,
      sender_id: data.sender_id,
      sender_name: profileData?.name || null,
      sender_avatar: profileData?.avatar_url || null
    };
  } catch (error) {
    console.error("Error sending message:", error);
    toast.error("Error sending message");
    return null;
  }
};
