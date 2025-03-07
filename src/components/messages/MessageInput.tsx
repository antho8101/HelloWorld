
import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
        // Focus will be maintained since we're not changing focus here
      }
    }
  };

  const handleSendClick = () => {
    onSend();
    // Refocus the textarea after sending
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  // Maintain focus when component is mounted
  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled]);

  return (
    <div className="border-t border-gray-200 p-3 bg-white">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1 resize-none bg-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#6153BD] min-h-[60px] max-h-[120px]"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSendClick}
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
