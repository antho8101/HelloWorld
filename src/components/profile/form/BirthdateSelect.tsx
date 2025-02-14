
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { differenceInYears, startOfToday } from "date-fns";
import { useEffect, useState } from "react";

interface BirthdateSelectProps {
  onAgeChange: (age: number) => void;
  error?: boolean;
}

export const BirthdateSelect = ({ onAgeChange, error }: BirthdateSelectProps) => {
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 13 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const days = month && year 
    ? Array.from({ length: getDaysInMonth(parseInt(month), parseInt(year)) }, (_, i) => i + 1)
    : Array.from({ length: 31 }, (_, i) => i + 1);

  useEffect(() => {
    if (day && month && year) {
      const birthdate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const age = differenceInYears(startOfToday(), birthdate);
      onAgeChange(age);
    }
  }, [day, month, year, onAgeChange]);

  return (
    <div>
      <label className="block text-sm font-bold text-[#6153BD] mb-1">
        Date of Birth
      </label>
      <div className={`grid grid-cols-3 gap-2 ${error ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}`}>
        <Select value={day} onValueChange={setDay}>
          <SelectTrigger className={error ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}>
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            {days.map((d) => (
              <SelectItem key={d} value={d.toString()}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className={error ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}>
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m.toString()}>
                {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className={error ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
