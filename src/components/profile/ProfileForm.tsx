
import { type ProfileData } from "@/types/profile";
import { ProfileAvatar } from "./ProfileAvatar";
import { BasicInfo } from "./BasicInfo";
import { LanguagesAndPreferences } from "./LanguagesAndPreferences";

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
  return (
    <>
      <div className="flex flex-col md:flex-row gap-8 mb-8">
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
        />
      </div>

      <LanguagesAndPreferences
        nativeLanguages={profile.native_languages}
        learningLanguages={profile.learning_languages}
        lookingFor={profile.looking_for}
        interestedIn={profile.interested_in}
        onNativeLanguagesChange={(native_languages) => onProfileChange({ native_languages })}
        onLearningLanguagesChange={(learning_languages) => onProfileChange({ learning_languages })}
        onLookingForChange={(looking_for) => onProfileChange({ looking_for })}
        onInterestedInChange={(interested_in) => onProfileChange({ interested_in })}
      />

      <button
        onClick={onSubmit}
        className="w-full bg-[#6153BD] text-white py-3 px-4 rounded-xl font-bold hover:bg-[#6153BD]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6153BD] transform transition-all duration-200 hover:scale-[1.02] mt-6"
      >
        Continue to Bio
      </button>
    </>
  );
};
