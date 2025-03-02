
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
  // Additional properties to maintain backward compatibility
  latest_message?: string | null;
  latest_message_time?: string | null;
  other_participant_id?: string | null;
  other_participant_name?: string | null;
  other_participant_avatar?: string | null;
  other_participant_online?: boolean;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender_name?: string | null;
  sender_avatar?: string | null;
}
