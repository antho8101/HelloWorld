
import React from "react";

export const EmptyConversation: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center p-6">
        <h3 className="text-lg font-medium text-gray-700">
          Select a conversation to start chatting
        </h3>
        <p className="text-gray-500 mt-1">
          Or search for someone new to message
        </p>
      </div>
    </div>
  );
};
