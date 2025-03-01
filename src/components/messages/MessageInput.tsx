
import React, { useRef, KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  TextBolder, 
  TextItalic, 
  TextUnderline, 
  Palette,
  Image as ImageIcon
} from "@phosphor-icons/react";

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleFormatClick: (format: string) => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  handleSendMessage,
  handleFormatClick,
  handleImageUpload,
  handleKeyPress
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4 border-t border-gray-200">
      {/* Formatting Toolbar */}
      <div className="flex items-center space-x-2 mb-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleFormatClick("bold")}
          className="text-gray-600 hover:text-[#6153BD] hover:bg-[#6153BD]/10"
        >
          <TextBolder size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleFormatClick("italic")}
          className="text-gray-600 hover:text-[#6153BD] hover:bg-[#6153BD]/10"
        >
          <TextItalic size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleFormatClick("underline")}
          className="text-gray-600 hover:text-[#6153BD] hover:bg-[#6153BD]/10"
        >
          <TextUnderline size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleFormatClick("color")}
          className="text-gray-600 hover:text-[#6153BD] hover:bg-[#6153BD]/10"
        >
          <Palette size={20} />
        </Button>
        <div className="h-5 w-px bg-gray-300 mx-2" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-600 hover:text-[#6153BD] hover:bg-[#6153BD]/10"
        >
          <ImageIcon size={20} />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className="flex space-x-4">
        <Textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..." 
          className="flex-1 min-h-[80px] resize-none"
        />
        <button 
          onClick={handleSendMessage}
          className="px-4 py-2 bg-[#6153BD] text-white rounded-lg hover:bg-[#6153BD]/90 transition-colors h-fit"
        >
          Send
        </button>
      </div>
    </div>
  );
};
