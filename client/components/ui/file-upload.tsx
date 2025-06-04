import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Upload, CheckCircle2 } from "lucide-react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  onFileUploadComplete?: (url: string) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  defaultPreview?: string;
}

export function FileUpload({
  onFileSelected,
  onFileUploadComplete,
  maxSizeMB = 2, // Default max size: 2MB
  acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  defaultPreview
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(defaultPreview || "");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setProgress(0);
    setIsComplete(false);

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setError(`File type not supported. Accepted types: ${acceptedTypes.map(t => t.replace('image/', '.')).join(', ')}`);
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
    onFileSelected(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(defaultPreview || "");
    setError(null);
    setProgress(0);
    setIsComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div className="mb-2">
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={acceptedTypes.join(",")}
          ref={fileInputRef}
        />
        <div className="flex flex-col items-center">
          {preview ? (
            <div className="relative mb-3 group">
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-primary"
              />
              <div 
                className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={clearFile}
              >
                <span className="text-white text-xs font-bold">REMOVE</span>
              </div>
              {isComplete && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ) : (
            <div 
              className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mb-3 cursor-pointer hover:border-primary transition-colors"
              onClick={triggerFileInput}
            >
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            type="button" 
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            {preview ? "Change Image" : "Upload Avatar"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-destructive flex items-center text-sm mt-1">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      {isUploading && (
        <div className="mt-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Uploading... {progress.toFixed(0)}%
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2">
        Max size: {maxSizeMB}MB. Supported formats: {acceptedTypes.map(t => t.replace('image/', '.')).join(', ')}
      </p>
    </div>
  );
}