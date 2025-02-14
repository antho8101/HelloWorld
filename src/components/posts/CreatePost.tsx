
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, PaperPlaneRight } from "@phosphor-icons/react";
import { toast } from "sonner";

interface CreatePostProps {
  userId: string;
  onPostCreated: () => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ userId, onPostCreated }) => {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
    } else {
      toast.error("Please select a valid image file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && !file) {
      toast.error("Please add some content or an image");
      return;
    }

    setIsSubmitting(true);
    try {
      let image_url = null;
      if (file) {
        const fileExt = file.name.split(".").pop();
        const filePath = `${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from("post_images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("post_images")
          .getPublicUrl(filePath);
        
        image_url = publicUrl;
      }

      const { error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: userId,
          content: content.trim() || null,
          image_url,
        });

      if (insertError) throw insertError;

      setContent("");
      setFile(null);
      onPostCreated();
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-md space-y-4">
      <Textarea
        placeholder="Share something with the community..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full min-h-[100px] resize-none"
      />
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <ImageIcon size={20} />
            {file ? "Change Image" : "Add Image"}
          </Button>
          {file && (
            <span className="text-sm text-gray-500">
              {file.name}
            </span>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting || (!content && !file)}
          className="bg-[#6153BD] hover:bg-[#6153BD]/90"
        >
          <PaperPlaneRight size={20} className="mr-2" />
          Post
        </Button>
      </div>
    </form>
  );
};
