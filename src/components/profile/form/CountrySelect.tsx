
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "../data/countries";

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const CountrySelect = ({ value, onChange }: CountrySelectProps) => {
  return (
    <div>
      <label className="block text-sm font-bold text-[#6153BD] mb-1">
        Country
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select country" />
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map((country) => (
            <SelectItem key={country.name} value={country.name}>
              <span className="flex items-center gap-2">
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
