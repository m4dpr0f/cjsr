import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CountdownModalProps {
  isOpen: boolean;
  count: number;
}

export function CountdownModal({
  isOpen,
  count
}: CountdownModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="bg-dark p-8 pixel-border max-w-md text-center border-0 sm:rounded-0">
        <h2 className="font-pixel text-2xl text-primary mb-6">RACE STARTING!</h2>
        <div className="font-pixel text-6xl text-secondary mb-6">{count}</div>
        <p className="text-light">Get your fingers ready...</p>
      </DialogContent>
    </Dialog>
  );
}
