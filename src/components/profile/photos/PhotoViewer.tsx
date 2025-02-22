
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
    <div className="fixed inset-0 w-screen h-screen bg-black z-[100] overflow-hidden">
      <div className="absolute inset-0 flex">
        {/* Left side - Photo */}
        <div className="relative flex-1 bg-black flex items-center justify-center">
          <img
            src={photoUrl}
            alt={`Photo ${photoIndex + 1}`}
            className="max-h-screen max-w-[calc(100vw-400px)] w-auto h-auto object-contain"
          />
          
          <Button
            variant="ghost"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 z-10"
            onClick={onPrevious}
          >
            <ArrowLeft size={24} weight="bold" />
          </Button>
          
          <Button
            variant="ghost"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 z-10"
            onClick={onNext}
          >
            <ArrowRight size={24} weight="bold" />
          </Button>
        </div>

        {/* Right side - Comments & Actions */}
        <div className="w-[400px] bg-white h-full overflow-hidden flex flex-col">
          <Button
            variant="ghost"
            onClick={onClose}
            className="absolute right-2 top-2 hover:bg-gray-100"
          >
            <X size={24} weight="bold" />
          </Button>
          <div className="p-6 flex-1 overflow-y-auto">
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
    </div>
  );
};
