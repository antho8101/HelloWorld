
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicInfoProps {
  username: string;
  gender: string;
  country: string;
  city: string;
  citySearch: string;
  cities: string[];
  onUsernameChange: (username: string) => void;
  onGenderChange: (gender: string) => void;
  onCountryChange: (country: string) => void;
  onCitySearch: (search: string) => void;
  onCitySelect: (city: string) => void;
}

const COUNTRIES = [
  "France", "United States", "United Kingdom", "Germany", "Spain", "Italy",
  "Canada", "Australia", "Japan", "China", "Brazil", "India"
] as const;

export const BasicInfo = ({
  username,
  gender,
  country,
  citySearch,
  cities,
  onUsernameChange,
  onGenderChange,
  onCountryChange,
  onCitySearch,
  onCitySelect,
}: BasicInfoProps) => {
  return (
    <div className="flex-1 max-w-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#6153BD] mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            className="w-full border-2 border-[#6153BD]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#6153BD] focus:border-transparent transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#6153BD] mb-1">
            Gender
          </label>
          <Select
            value={gender}
            onValueChange={onGenderChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#6153BD] mb-1">
            Country
          </label>
          <Select
            value={country}
            onValueChange={onCountryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-[#6153BD] mb-1">
            City
          </label>
          <div className="relative">
            <input
              type="text"
              value={citySearch}
              onChange={(e) => onCitySearch(e.target.value)}
              disabled={!country}
              className="w-full border-2 border-[#6153BD]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#6153BD] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={country ? "Start typing your city..." : "Please select a country first"}
            />
            {cities.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                {cities.map((city) => (
                  <div
                    key={city}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => onCitySelect(city)}
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
