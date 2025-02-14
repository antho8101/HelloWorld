
import React from "react";
import { Button } from "@/components/ui/button";
import { Warning } from "@phosphor-icons/react";

interface ReportButtonProps {
  onClick: () => void;
}

export const ReportButton: React.FC<ReportButtonProps> = ({ onClick }) => {
  return (
    <div className="flex justify-center">
      <Button 
        onClick={onClick}
        variant="ghost"
        className="text-gray-500 hover:text-red-600 text-sm flex items-center gap-1.5 py-1.5"
      >
        <Warning size={16} weight="bold" />
        Report inappropriate behavior
      </Button>
    </div>
  );
};
