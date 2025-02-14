
import React from "react";
import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";
import { PhotoCommentView } from "@/types/photo";

interface PhotoViewerProps {
  photoUrl: string;
  photoIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
  comments: PhotoCommentView[];
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
    <div className="relative">
      <Button
        variant="ghost"
        className="absolute top-2 right-2 text-white hover:bg-black/20 z-10"
        onClick={onClose}
      >
        <X size={24} weight="bold" />
      </Button>
      
      <div className="grid grid-cols-[1fr,400px]">
        <div className="relative bg-black">
          <img
            src={photoUrl}
            alt={`Photo ${photoIndex + 1}`}
            className="w-full h-[600px] object-contain"
          />
          
          <Button
            variant="ghost"
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/20"
            onClick={onPrevious}
          >
            <ArrowLeft size={24} weight="bold" />
          </Button>
          
          <Button
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/20"
            onClick={onNext}
          >
            <ArrowRight size={24} weight="bold" />
          </Button>
        </div>

        <div className="p-4 flex flex-col h-[600px]">
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
