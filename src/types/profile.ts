
import type { LanguageWithLevel } from "@/components/LanguageSelector";

export interface ProfileData {
  id?: string | null;
  username: string | null;
  name: string | null;
  age: number | null;
  avatar_url: string | null;
  native_languages: LanguageWithLevel[];
  language_levels: LanguageWithLevel[];
  country: string | null;
  city: string | null;
  bio: string | null;
  gender: string | null;
  interested_in: string[];
  looking_for: string[];
  is_suspended?: boolean | null;
  is_banned?: boolean | null;
  suspension_end_timestamp?: string | null;
}

export interface FriendRequest {
  id: string;
  created_at: string;
  sender: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
}
