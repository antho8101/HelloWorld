
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
}

export const GenderSelect = ({ value, onChange }: GenderSelectProps) => {
  return (
    <div>
      <label className="block text-sm font-bold text-[#6153BD] mb-1">
        Gender
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
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
