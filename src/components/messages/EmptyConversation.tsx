
import React from "react";
import { ChatCircleDots, MagnifyingGlass, ArrowClockwise } from "@phosphor-icons/react";

interface EmptyConversationProps {
  hasError?: boolean;
  onRetry?: () => void;
}

export const EmptyConversation: React.FC<EmptyConversationProps> = ({ 
  hasError = false,
  onRetry
}) => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center p-6 max-w-md">
        <div className="flex justify-center mb-4">
          {hasError ? (
            <ChatCircleDots size={48} weight="duotone" className="text-red-400" />
          ) : (
            <ChatCircleDots size={48} weight="thin" className="text-gray-400" />
          )}
        </div>
        
        <h3 className="text-xl font-medium text-gray-700">
          {hasError 
            ? "There was an issue with your conversation" 
            : "Select a conversation to start chatting"}
        </h3>
        
        <p className="text-gray-500 mt-2">
          {hasError 
            ? "We couldn't establish a connection with the messaging service." 
            : "Choose an existing conversation from the list or search for someone new to message"}
        </p>
        
        <div className="mt-6">
          {hasError ? (
            <button 
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-md text-indigo-600 transition-colors"
            >
              <ArrowClockwise size={20} weight="bold" />
              Try again
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-md text-gray-500">
              <MagnifyingGlass size={20} weight="bold" />
              Find someone to message
            </div>
          )}
        </div>
        
        {hasError && (
          <div className="mt-4 text-sm text-gray-400 bg-gray-50 p-3 rounded-lg">
            <p>
              You might be experiencing connection issues. If this persists, 
              try refreshing the page or checking your internet connection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
