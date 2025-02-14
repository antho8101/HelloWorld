
import React from "react";
import { Badge } from "@/components/ui/badge";
import type { LanguageWithLevel } from "@/components/LanguageSelector";
import { Flag } from "lucide-react";

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
          <Flag className="h-5 w-5" />
          Native Languages
        </h2>
        <div className="flex flex-wrap gap-2">
          {nativeLanguages.map((lang) => (
            <Badge key={lang} variant="secondary" className="flex items-center gap-1.5">
              <Flag className="h-3.5 w-3.5" />
              <span>{lang}</span>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#6153BD] flex items-center gap-2">
          <Flag className="h-5 w-5" />
          Learning Languages
        </h2>
        <div className="flex flex-wrap gap-2">
          {learningLanguages.map((lang) => (
            <Badge key={lang.language} variant="outline" className="flex items-center gap-1.5">
              <Flag className="h-3.5 w-3.5" />
              <span>{lang.language}</span>
              {lang.level && <span className="text-gray-500">({lang.level})</span>}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
