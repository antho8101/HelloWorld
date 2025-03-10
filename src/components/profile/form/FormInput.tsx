
interface FormInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  min?: number;
  max?: number;
  disabled?: boolean;
  placeholder?: string;
  error?: boolean;
}

export const FormInput = ({
  label,
  value,
  onChange,
  type = "text",
  min,
  max,
  disabled,
  placeholder,
  error,
}: FormInputProps) => {
  return (
    <div>
      <label className="block text-sm font-bold text-[#6153BD] mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full border-2 ${error ? 'border-red-500 animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-[#6153BD]/20'} rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#6153BD] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
      />
    </div>
  );
};
