import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface DamageReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingName: string;
}

const DamageReportDialog = ({ open, onOpenChange, listingName }: DamageReportDialogProps) => {
  const [report, setReport] = useState('');
  const { toast } = useToast();

  const handleSend = () => {
    if (!report.trim()) {
      toast({ title: 'Please describe the damage', variant: 'destructive' });
      return;
    }
    toast({ title: 'Damage report sent!' });
    setReport('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Damage Report: {listingName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Textarea
            placeholder="Describe the damage in detail..."
            value={report}
            onChange={(e) => setReport(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSend} className="w-full bg-primary text-primary-foreground hover:bg-orange-dark">
            Send Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DamageReportDialog;
