
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlobeIcon } from "lucide-react";

export const LanguageSelector: React.FC = () => {
  return (
    <Select defaultValue="en">
      <SelectTrigger className="w-[140px] h-[42px] text-[#FF6A48] border-2 border-[#FF6A48] font-medium flex items-center gap-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md rounded-[10px]">
        <GlobeIcon className="h-5 w-5" />
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="es">Español</SelectItem>
        <SelectItem value="fr">Français</SelectItem>
        <SelectItem value="zh">中文</SelectItem>
        <SelectItem value="ar">العربية</SelectItem>
      </SelectContent>
    </Select>
  );
};
