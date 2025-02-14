
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlobeIcon } from "lucide-react";
import { ArrowLeft } from "@phosphor-icons/react";

export const RegisterHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="flex w-full items-center justify-between flex-wrap px-5 py-2.5 max-md:max-w-full bg-[#FFF3F0]">
      <div 
        onClick={() => navigate("/")}
        className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <img
          loading="lazy"
          srcSet="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/fc1f6b1b3fc6ee87b690f1b6be44876cdf1e0e313d0c5d6607e5e53302011af2?placeholderIfAbsent=true&width=100 100w, https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/fc1f6b1b3fc6ee87b690f1b6be44876cdf1e0e313d0c5d6607e5e53302011af2?placeholderIfAbsent=true&width=200 200w"
          className="aspect-[1] object-contain w-[76px] shrink-0"
          alt="HelloWorld! Logo"
        />
        <div className="flex flex-col justify-center">
          <div className="text-[rgba(97,83,189,1)] text-4xl font-black leading-none">
            HelloWorld!
          </div>
          <div className="text-[rgba(255,106,72,1)] text-base font-bold">
            The world in one place
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-5 text-base font-bold my-auto">
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
        
        <button 
          onClick={() => navigate("/")}
          className="bg-white gap-2.5 text-[#6153BD] whitespace-nowrap px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#6153BD] hover:text-white flex items-center"
        >
          <ArrowLeft size={20} weight="bold" className="mr-2" />
          Back to Homepage
        </button>
      </nav>
    </header>
  );
};
