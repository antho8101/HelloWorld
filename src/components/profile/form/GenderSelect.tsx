
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GenderSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export const GenderSelect = ({ value, onChange, error }: GenderSelectProps) => {
  return (
    <div>
      <label className="block text-sm font-bold text-[#6153BD] mb-1">
        Gender
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}>
          <SelectValue placeholder="Select gender" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="male">Male</SelectItem>
          <SelectItem value="female">Female</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
