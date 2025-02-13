
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface ProfileErrorProps {
  error: string;
}

export const ProfileError: React.FC<ProfileErrorProps> = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[rgba(255,243,240,1)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#6153BD] font-bold mb-8 hover:text-[#6153BD]/90 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <div className="bg-white/80 backdrop-blur-sm rounded-[20px] shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-[#6153BD] mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    </div>
  );
};
