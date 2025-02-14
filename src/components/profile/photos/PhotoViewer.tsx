
import React from "react";
import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";

interface PhotoViewerProps {
  photoUrl: string;
  photoIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
  comments: Comment[];
  newComment: string;
  onCommentChange: (value: string) => void;
  onCommentSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  photoUrl,
  photoIndex,
  onClose,
  onPrevious,
  onNext,
  isLiked,
  likesCount,
  onLike,
  comments,
  newComment,
  onCommentChange,
  onCommentSubmit,
  isSubmitting,
}) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-50">
      <Button
        variant="ghost"
        className="absolute top-4 right-4 text-white hover:bg-black/20 z-10"
        onClick={onClose}
      >
        <X size={24} weight="bold" />
      </Button>
      
      <div className="grid h-screen grid-cols-[1fr,400px]">
        <div className="relative flex items-center justify-center">
          <img
            src={photoUrl}
            alt={`Photo ${photoIndex + 1}`}
            className="max-h-screen max-w-full object-contain"
          />
          
          <Button
            variant="ghost"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/20"
            onClick={onPrevious}
          >
            <ArrowLeft size={24} weight="bold" />
          </Button>
          
          <Button
            variant="ghost"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/20"
            onClick={onNext}
          >
            <ArrowRight size={24} weight="bold" />
          </Button>
        </div>

        <div className="p-6 bg-white h-screen overflow-y-auto">
          <LikeButton isLiked={isLiked} likesCount={likesCount} onClick={onLike} />
          <CommentSection
            comments={comments}
            newComment={newComment}
            onCommentChange={onCommentChange}
            onCommentSubmit={onCommentSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};
