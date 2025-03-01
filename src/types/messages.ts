
export interface ConversationParticipant {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  is_archived: boolean;
  otherParticipant: ConversationParticipant | null;
  isTemporary?: boolean;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender_name?: string | null;
  sender_avatar?: string | null;
}
