
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CropDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cropImage: string;
  crop: Crop;
  onCropChange: (crop: Crop) => void;
  imgRef: React.RefObject<HTMLImageElement>;
  onSave: () => void;
  onCancel: () => void;
}

export const CropDialog = ({
  isOpen,
  onOpenChange,
  cropImage,
  crop,
  onCropChange,
  imgRef,
  onSave,
  onCancel,
}: CropDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="max-h-[500px] overflow-auto">
            <ReactCrop
              crop={crop}
              onChange={onCropChange}
              aspect={1}
              circularCrop
            >
              <img
                ref={imgRef}
                src={cropImage}
                alt="Crop preview"
                className="max-w-full h-auto"
              />
            </ReactCrop>
          </div>
          <DialogFooter className="flex gap-2 w-full">
            <Button
              className="bg-[#6153BD] hover:bg-[#6153BD]/90 text-white border-2 border-[rgba(18,0,113,1)]"
              onClick={onSave}
            >
              Save
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
