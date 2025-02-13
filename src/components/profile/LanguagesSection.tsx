
import React from "react";
import { Badge } from "@/components/ui/badge";
import type { LanguageWithLevel } from "@/components/LanguageSelector";

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
        <h2 className="text-lg font-bold text-[#6153BD]">Native Languages</h2>
        <div className="flex flex-wrap gap-2">
          {nativeLanguages.map((lang) => (
            <Badge key={lang} variant="secondary">{lang}</Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#6153BD]">Learning Languages</h2>
        <div className="flex flex-wrap gap-2">
          {learningLanguages.map((lang) => (
            <Badge key={lang.language} variant="outline" className="space-x-1">
              <span>{lang.language}</span>
              {lang.level && <span className="text-gray-500">({lang.level})</span>}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
