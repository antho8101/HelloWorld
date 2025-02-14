
import type { LanguageWithLevel } from "@/components/LanguageSelector";

export interface ProfileData {
  username: string;
  name: string;
  age: number;
  avatar_url: string;
  native_languages: LanguageWithLevel[];
  learning_languages: LanguageWithLevel[];
  country: string;
  city: string;
  bio: string;
  gender: string;
  interested_in: string[];
  looking_for: string[];
  language_levels: LanguageWithLevel[];
  is_suspended?: boolean;
  is_banned?: boolean;
  suspension_end_timestamp?: string | null;
}
