import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { reviewService } from '@/lib/api-services';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingName: string;
  rentalId: string;      // ✅ add this
  listingId: string;     // ✅ add this
}

const ReviewDialog = ({ open, onOpenChange, listingName, rentalId, listingId }: ReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (rating === 0) {
      toast({ title: 'Please select a rating', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await reviewService.create({
        rental_id: rentalId,
        target_type: 'listing',
        rating,
        comment: comment || undefined,
      });
      toast({ title: 'Review submitted!' });
      setRating(0);
      setComment('');
      onOpenChange(false);
    } catch {
      toast({ title: 'Failed to submit review', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Review: {listingName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-1 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="p-1 transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  size={32}
                  className={
                    star <= (hover || rating)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground/30'
                  }
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-orange-dark"
          >
            {loading ? 'Submitting...' : 'Save Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
