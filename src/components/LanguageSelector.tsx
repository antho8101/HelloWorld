
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const LANGUAGE_LEVELS = ['beginner', 'intermediate', 'advanced', 'fluent'] as const;
const LANGUAGES = [
  "English", "French", "Spanish", "German", "Italian", "Portuguese", "Russian",
  "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Bengali", "Turkish",
  "Vietnamese", "Thai", "Indonesian", "Dutch", "Polish", "Greek"
] as const;

export interface LanguageWithLevel {
  language: string;
  level?: string;
}

interface LanguageSelectorProps {
  languages: LanguageWithLevel[];
  onChange: (languages: LanguageWithLevel[]) => void;
  showLevel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  onChange,
  showLevel = true,
}) => {
  const handleAddLanguage = () => {
    onChange([...languages, { language: "", level: showLevel ? "beginner" : undefined }]);
  };

  const handleRemoveLanguage = (index: number) => {
    const newLanguages = languages.filter((_, i) => i !== index);
    onChange(newLanguages);
  };

  const handleLanguageChange = (index: number, value: string) => {
    const newLanguages = [...languages];
    newLanguages[index] = { ...newLanguages[index], language: value };
    onChange(newLanguages);
  };

  const handleLevelChange = (index: number, value: string) => {
    const newLanguages = [...languages];
    newLanguages[index] = { ...newLanguages[index], level: value };
    onChange(newLanguages);
  };

  return (
    <div className="space-y-4">
      {languages.map((lang, index) => (
        <div key={index} className="flex items-center gap-2">
          <Select
            value={lang.language}
            onValueChange={(value) => handleLanguageChange(index, value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showLevel && (
            <Select
              value={lang.level}
              onValueChange={(value) => handleLevelChange(index, value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveLanguage(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={handleAddLanguage}
        className="mt-2"
      >
        Add Language
      </Button>
    </div>
  );
};
