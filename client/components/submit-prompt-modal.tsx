import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PixelButton } from "@/components/ui/pixel-button";
import { Textarea } from "@/components/ui/textarea";

interface SubmitPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
}

export function SubmitPromptModal({
  isOpen,
  onClose,
  onSubmit
}: SubmitPromptModalProps) {
  const [prompt, setPrompt] = useState("");
  const minLength = 50;
  const maxLength = 250;
  
  // Reset prompt when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrompt("");
    }
  }, [isOpen]);
  
  const handleSubmit = () => {
    if (prompt.length >= minLength && prompt.length <= maxLength) {
      onSubmit(prompt);
      onClose();
    }
  };
  
  const isValidLength = prompt.length >= minLength && prompt.length <= maxLength;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark p-8 pixel-border max-w-md text-light border-0 sm:rounded-0">
        <h2 className="font-pixel text-xl text-primary mb-6 text-center">SUBMIT NEW PROMPT</h2>
        
        <p className="text-light mb-4">
          Congratulations! As the winner, you get to submit a new prompt for future races:
        </p>
        
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full bg-light text-dark border-2 border-primary p-3 font-body text-lg h-32 mb-4"
          placeholder="Enter your race prompt here..."
        />
        
        <div className="flex justify-between text-xs text-secondary mb-4">
          <span>Min: {minLength} characters</span>
          <span>{prompt.length}/{maxLength} characters</span>
        </div>
        
        <div className="flex space-x-2">
          <PixelButton
            className="flex-1"
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValidLength}
          >
            SUBMIT
          </PixelButton>
          <PixelButton
            className="flex-1"
            variant="outlined"
            onClick={onClose}
          >
            CANCEL
          </PixelButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
