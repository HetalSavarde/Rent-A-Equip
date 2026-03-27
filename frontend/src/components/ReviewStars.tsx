import { Star } from 'lucide-react';

const ReviewStars = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= Math.round(rating) ? 'fill-primary text-primary' : 'text-muted-foreground/30'}
        />
      ))}
    </div>
  );
};

export default ReviewStars;
