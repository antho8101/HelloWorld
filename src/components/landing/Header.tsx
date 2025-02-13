
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlobeIcon } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="flex w-full items-center gap-[40px_100px] justify-between flex-wrap px-5 py-2.5 max-md:max-w-full">
      <div className="self-stretch flex min-w-60 items-center gap-2.5 my-auto">
        <img
          loading="lazy"
          srcSet="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/fc1f6b1b3fc6ee87b690f1b6be44876cdf1e0e313d0c5d6607e5e53302011af2?placeholderIfAbsent=true&width=100 100w, https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/fc1f6b1b3fc6ee87b690f1b6be44876cdf1e0e313d0c5d6607e5e53302011af2?placeholderIfAbsent=true&width=200 200w"
          className="aspect-[1] object-contain w-[76px] self-stretch shrink-0 my-auto"
          alt="HelloWorld! Logo"
        />
        <div className="self-stretch flex flex-col justify-center my-auto">
          <div className="text-[rgba(97,83,189,1)] text-4xl font-black leading-none">
            HelloWorld!
          </div>
          <div className="text-[rgba(255,106,72,1)] text-base font-bold">
            The world in one place
          </div>
        </div>
      </div>
      <nav className="self-stretch flex min-w-60 items-center gap-5 text-base font-bold justify-center my-auto">
        <Select defaultValue="en">
          <SelectTrigger className="w-[140px] h-[42px] text-[#FF6A48] border-2 border-[#FF6A48] font-medium flex items-center gap-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
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
        <button className="bg-[rgba(97,83,189,1)] self-stretch flex items-center gap-2.5 text-white justify-center my-auto px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[rgba(97,83,189,0.9)]">
          <span className="self-stretch my-auto">Get started</span>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/6f00598569306f4eed36007bf36924a551566ffaca4cf8d159b94c54cd033c0b?placeholderIfAbsent=true"
            className="aspect-[1] object-contain w-[21px] self-stretch shrink-0 my-auto"
            alt=""
          />
        </button>
        <button className="self-stretch bg-white gap-2.5 text-[#6153BD] whitespace-nowrap my-auto px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#6153BD] hover:text-white">
          Login
        </button>
      </nav>
    </header>
  );
};
