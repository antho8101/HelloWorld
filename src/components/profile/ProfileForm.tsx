
import { type ProfileData } from "@/types/profile";
import { ProfileAvatar } from "./ProfileAvatar";
import { BasicInfo } from "./BasicInfo";
import { LanguagesAndPreferences } from "./LanguagesAndPreferences";
import { useState } from "react";

interface ProfileFormProps {
  userId: string;
  profile: ProfileData;
  citySearch: string;
  cities: string[];
  onProfileChange: (updates: Partial<ProfileData>) => void;
  onCitySearch: (search: string) => void;
  onCitySelect: (city: string) => void;
  onSubmit: () => void;
}

export const ProfileForm = ({
  userId,
  profile,
  citySearch,
  cities,
  onProfileChange,
  onCitySearch,
  onCitySelect,
  onSubmit,
}: ProfileFormProps) => {
  const [showErrors, setShowErrors] = useState(false);

  const validations = {
    username: !profile.username?.trim(),
    name: !profile.name?.trim(),
    age: profile.age <= 0,
    gender: !profile.gender?.trim(),
    country: !profile.country?.trim(),
    city: !profile.city?.trim(),
    nativeLanguages: profile.native_languages.length === 0 || 
      !profile.native_languages.every(lang => lang.language?.trim()),
    learningLanguages: profile.learning_languages.length === 0 || 
      !profile.learning_languages.every(lang => lang.language?.trim() && lang.level?.trim()),
    lookingFor: profile.looking_for.length === 0,
    interestedIn: profile.interested_in.length === 0
  };

  const isFormValid = () => {
    return !Object.values(validations).some(invalid => invalid);
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      setShowErrors(true);
      return;
    }
    onSubmit();
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <ProfileAvatar
          userId={userId}
          username={profile.username}
          avatarUrl={profile.avatar_url}
          onAvatarChange={(url) => onProfileChange({ avatar_url: url })}
        />

        <BasicInfo
          username={profile.username}
          name={profile.name}
          age={profile.age}
          gender={profile.gender}
          country={profile.country}
          city={profile.city}
          citySearch={citySearch}
          cities={cities}
          onUsernameChange={(username) => onProfileChange({ username })}
          onNameChange={(name) => onProfileChange({ name })}
          onAgeChange={(age) => onProfileChange({ age })}
          onGenderChange={(gender) => onProfileChange({ gender })}
          onCountryChange={(country) => onProfileChange({ country })}
          onCitySearch={onCitySearch}
          onCitySelect={onCitySelect}
          errors={showErrors ? {
            username: validations.username,
            name: validations.name,
            age: validations.age,
            gender: validations.gender,
            country: validations.country,
            city: validations.city
          } : undefined}
        />

        <div className="flex-1">
          <LanguagesAndPreferences
            nativeLanguages={profile.native_languages}
            learningLanguages={profile.learning_languages}
            lookingFor={profile.looking_for}
            interestedIn={profile.interested_in}
            onNativeLanguagesChange={(native_languages) => onProfileChange({ native_languages })}
            onLearningLanguagesChange={(learning_languages) => onProfileChange({ learning_languages })}
            onLookingForChange={(looking_for) => onProfileChange({ looking_for })}
            onInterestedInChange={(interested_in) => onProfileChange({ interested_in })}
            errors={showErrors ? {
              nativeLanguages: validations.nativeLanguages,
              learningLanguages: validations.learningLanguages,
              lookingFor: validations.lookingFor,
              interestedIn: validations.interestedIn
            } : undefined}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-[#6153BD] text-white py-3 px-4 rounded-xl font-bold hover:bg-[#6153BD]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6153BD] transform transition-all duration-200 hover:scale-[1.02] mt-6"
      >
        Continue to Bio
      </button>
    </>
  );
};
