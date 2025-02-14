
import React from "react";
import { useNavigate } from "react-router-dom";

interface AuthButtonsProps {
  isLoggedIn: boolean;
  isTransitioning: boolean;
  onLogout: () => void;
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({ 
  isLoggedIn, 
  isTransitioning, 
  onLogout 
}) => {
  const navigate = useNavigate();
  
  if (isLoggedIn) {
    return (
      <button 
        onClick={onLogout}
        disabled={isTransitioning}
        className="bg-white gap-2.5 text-[#6153BD] whitespace-nowrap px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#6153BD] hover:text-white disabled:opacity-50"
      >
        Logout
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={() => navigate("/signup")}
        disabled={isTransitioning}
        className="bg-[rgba(97,83,189,1)] flex items-center gap-2.5 text-white justify-center px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[rgba(97,83,189,0.9)] disabled:opacity-50"
      >
        <span>Get started</span>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/f97848ecf61542bea4ab8ab7f8d20ea9/6f00598569306f4eed36007bf36924a551566ffaca4cf8d159b94c54cd033c0b?placeholderIfAbsent=true"
          className="aspect-[1] object-contain w-[21px]"
          alt=""
        />
      </button>
      <button 
        onClick={() => navigate("/login")}
        disabled={isTransitioning}
        className="bg-white gap-2.5 text-[#6153BD] whitespace-nowrap px-5 py-2.5 rounded-[10px] border-[rgba(18,0,113,1)] border-solid border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#6153BD] hover:text-white disabled:opacity-50"
      >
        Login
      </button>
    </>
  );
};
