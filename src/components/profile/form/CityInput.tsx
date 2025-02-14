
interface CityInputProps {
  searchValue: string;
  onSearchChange: (search: string) => void;
  onCitySelect: (city: string) => void;
  cities: string[];
  disabled: boolean;
  error?: boolean;
}

export const CityInput = ({
  searchValue,
  onSearchChange,
  onCitySelect,
  cities,
  disabled,
  error,
}: CityInputProps) => {
  return (
    <div>
      <label className="block text-sm font-bold text-[#6153BD] mb-1">
        City
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={disabled}
          className={`w-full border-2 ${error ? 'border-red-500 animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-[#6153BD]/20'} rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#6153BD] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          placeholder={disabled ? "Please select a country first" : "Start typing your city..."}
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
  );
};
