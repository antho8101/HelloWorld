
import { FormInput } from "./form/FormInput";
import { GenderSelect } from "./form/GenderSelect";
import { CountrySelect } from "./form/CountrySelect";
import { CityInput } from "./form/CityInput";
import { BirthdateSelect } from "./form/BirthdateSelect";

interface BasicInfoProps {
  username: string;
  name: string;
  age: number;
  gender: string;
  country: string;
  city: string;
  citySearch: string;
  cities: string[];
  onUsernameChange: (username: string) => void;
  onNameChange: (name: string) => void;
  onAgeChange: (age: number) => void;
  onGenderChange: (gender: string) => void;
  onCountryChange: (country: string) => void;
  onCitySearch: (search: string) => void;
  onCitySelect: (city: string) => void;
}

export const BasicInfo = ({
  username,
  name,
  age,
  gender,
  country,
  city,
  citySearch,
  cities,
  onUsernameChange,
  onNameChange,
  onAgeChange,
  onGenderChange,
  onCountryChange,
  onCitySearch,
  onCitySelect,
}: BasicInfoProps) => {
  return (
    <div className="flex-1 max-w-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Username"
          value={username}
          onChange={onUsernameChange}
        />
        <FormInput
          label="Full Name"
          value={name}
          onChange={onNameChange}
        />
        <div className="md:col-span-2">
          <BirthdateSelect onAgeChange={onAgeChange} />
        </div>
        <GenderSelect
          value={gender}
          onChange={onGenderChange}
        />
        <CountrySelect
          value={country}
          onChange={onCountryChange}
        />
        <CityInput
          searchValue={citySearch}
          onSearchChange={onCitySearch}
          onCitySelect={onCitySelect}
          cities={cities}
          disabled={!country}
        />
      </div>
    </div>
  );
};
