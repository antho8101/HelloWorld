
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  value,
  onChange,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Textarea
        placeholder="Add a comment..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="resize-none"
      />
      <Button
        type="submit"
        disabled={isSubmitting || !value.trim()}
        className="bg-[#6153BD] hover:bg-[#6153BD]/90"
      >
        Post Comment
      </Button>
    </form>
  );
};
