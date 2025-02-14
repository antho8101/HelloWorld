
import React from "react";
import { useNavigate } from "react-router-dom";

export const Logo: React.FC = () => {
  const navigate = useNavigate();
  
  return (
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
  );
};
