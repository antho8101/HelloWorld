
import React, { useState, KeyboardEvent } from "react";
import { PaperPlaneRight, Spinner } from "@phosphor-icons/react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  value, 
  onChange, 
  onSend,
  disabled = false,
  isLoading = false 
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="border-t border-gray-200 p-3 bg-white">
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1 resize-none bg-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#6153BD] min-h-[60px] max-h-[120px]"
          placeholder="Type a message..."
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className={`p-3 rounded-full ${
            disabled || !value.trim() ? 'bg-gray-200 text-gray-400' : 'bg-[#6153BD] text-white'
          } flex items-center justify-center`}
        >
          {isLoading ? (
            <Spinner size={20} weight="bold" className="animate-spin" />
          ) : (
            <PaperPlaneRight size={20} weight="fill" />
          )}
        </button>
      </div>
    </div>
  );
};
