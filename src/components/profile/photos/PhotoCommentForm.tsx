
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatCircleText } from "@phosphor-icons/react";

interface PhotoCommentFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const PhotoCommentForm: React.FC<PhotoCommentFormProps> = ({
  value,
  onChange,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <form onSubmit={onSubmit} className="mt-4">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a comment..."
        className="min-h-[80px] resize-none"
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full bg-[#6153BD] hover:bg-[#6153BD]/90 text-white gap-2"
      >
        <ChatCircleText size={20} weight="bold" />
        {isSubmitting ? "Posting comment..." : "Post comment"}
      </Button>
    </form>
  );
};
