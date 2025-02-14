
import React from "react";
import { Badge } from "@/components/ui/badge";
import type { LanguageWithLevel } from "@/components/LanguageSelector";
import { GlobeHemisphereWest, Translate, Books } from "@phosphor-icons/react";

const getLanguageFlag = (language: string): string => {
  const flags: { [key: string]: string } = {
    "English": "🇬🇧",
    "French": "🇫🇷",
    "Spanish": "🇪🇸",
    "German": "🇩🇪",
    "Italian": "🇮🇹",
    "Portuguese": "🇵🇹",
    "Russian": "🇷🇺",
    "Japanese": "🇯🇵",
    "Korean": "🇰🇷",
    "Chinese": "🇨🇳",
    "Arabic": "🇸🇦",
    "Hindi": "🇮🇳",
    "Bengali": "🇧🇩",
    "Dutch": "🇳🇱",
    "Polish": "🇵🇱",
    "Turkish": "🇹🇷",
    "Vietnamese": "🇻🇳",
    "Thai": "🇹🇭",
    "Indonesian": "🇮🇩",
    "Greek": "🇬🇷",
    "Swedish": "🇸🇪",
    "Norwegian": "🇳🇴",
    "Danish": "🇩🇰",
    "Finnish": "🇫🇮",
  };
  return flags[language] || "🌐";
};

interface LanguagesSectionProps {
  nativeLanguages: string[];
  learningLanguages: LanguageWithLevel[];
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  nativeLanguages,
  learningLanguages,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#6153BD] flex items-center gap-2">
          <Translate className="h-5 w-5" />
          Native Languages
        </h2>
        <div className="flex flex-wrap gap-2">
          {nativeLanguages.map((lang) => (
            <Badge key={lang} variant="secondary" className="flex items-center gap-1.5">
              {getLanguageFlag(lang)}
              <span>{lang}</span>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#6153BD] flex items-center gap-2">
          <Books className="h-5 w-5" />
          Learning Languages
        </h2>
        <div className="flex flex-wrap gap-2">
          {learningLanguages.map((lang) => (
            <Badge key={lang.language} variant="outline" className="flex items-center gap-1.5">
              {getLanguageFlag(lang.language)}
              <span>{lang.language}</span>
              {lang.level && <span className="text-gray-500">({lang.level})</span>}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
