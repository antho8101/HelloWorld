
import React from "react";
import { Chat } from "@phosphor-icons/react";

export const EmptyConversation: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center p-6 max-w-md">
        <div className="flex justify-center mb-4">
          <Chat size={48} weight="thin" className="text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-700">
          Select a conversation to start chatting
        </h3>
        <p className="text-gray-500 mt-2">
          Choose an existing conversation from the list or search for someone new to message
        </p>
        <div className="mt-4 text-sm text-gray-400 bg-gray-50 p-3 rounded-lg">
          <p>
            If you're experiencing issues with starting new conversations, 
            try refreshing the page or checking your connection.
          </p>
        </div>
      </div>
    </div>
  );
};
