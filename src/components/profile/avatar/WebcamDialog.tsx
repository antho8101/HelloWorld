
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WebcamDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  onTakePhoto: () => void;
  onClose: () => void;
}

export const WebcamDialog = ({
  isOpen,
  onOpenChange,
  videoRef,
  onTakePhoto,
  onClose,
}: WebcamDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Take a Photo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg bg-muted"
          />
          <div className="flex gap-2">
            <Button 
              onClick={onTakePhoto}
              className="bg-[#6153BD] hover:bg-[#6153BD]/90 text-white border-2 border-[rgba(18,0,113,1)]"
            >
              Take Photo
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
