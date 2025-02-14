
import React from "react";
import { LanguageSelector, type LanguageWithLevel } from "@/components/LanguageSelector";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguagesAndPreferencesProps {
  nativeLanguages: LanguageWithLevel[];
  learningLanguages: LanguageWithLevel[];
  lookingFor: string[];
  interestedIn: string[];
  onNativeLanguagesChange: (languages: LanguageWithLevel[]) => void;
  onLearningLanguagesChange: (languages: LanguageWithLevel[]) => void;
  onLookingForChange: (lookingFor: string[]) => void;
  onInterestedInChange: (interestedIn: string[]) => void;
  errors?: {
    nativeLanguages?: boolean;
    learningLanguages?: boolean;
    lookingFor?: boolean;
    interestedIn?: boolean;
  };
}

export const LanguagesAndPreferences = ({
  nativeLanguages,
  learningLanguages,
  lookingFor,
  interestedIn,
  onNativeLanguagesChange,
  onLearningLanguagesChange,
  onLookingForChange,
  onInterestedInChange,
  errors,
}: LanguagesAndPreferencesProps) => {
  return (
    <div className="space-y-6 h-fit">
      <div>
        <label className="block text-sm font-bold text-[#6153BD] mb-2">
          Native Languages
        </label>
        <div className={errors?.nativeLanguages ? 'animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}>
          <LanguageSelector
            languages={nativeLanguages}
            onChange={onNativeLanguagesChange}
            showLevel={false}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-[#6153BD] mb-2">
          Learning Languages
        </label>
        <div className={errors?.learningLanguages ? 'animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}>
          <LanguageSelector
            languages={learningLanguages}
            onChange={onLearningLanguagesChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-[#6153BD] mb-2">
            I Want to Meet
          </label>
          <Select
            value={interestedIn[0] || ""}
            onValueChange={(value) => onInterestedInChange([value])}
          >
            <SelectTrigger className={errors?.interestedIn ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}>
              <SelectValue placeholder="Select who you want to meet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="women">Women</SelectItem>
              <SelectItem value="men">Men</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#6153BD] mb-2">
            I'm Looking For
          </label>
          <div className={`space-y-2 ${errors?.lookingFor ? 'animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_10px_rgba(239,68,68,0.5)] p-2 rounded-md' : ''}`}>
            {['friends', 'postal_exchange', 'in_person_meetings', 'flirting'].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={lookingFor.includes(option)}
                  onCheckedChange={(checked) => {
                    onLookingForChange(
                      checked
                        ? [...lookingFor, option]
                        : lookingFor.filter(item => item !== option)
                    );
                  }}
                />
                <label
                  htmlFor={option}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
