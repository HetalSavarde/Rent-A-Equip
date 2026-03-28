import { categoryIcons } from '@/lib/api-services';
import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ListingCardProps {
  id: string;
  name: string;
  category: string;
  daily_rate: number;
  location: string;
  available_qty: number;
  avg_rating?: number;
  total_reviews?: number;
  lister: { name: string; avg_rating: number; phone?: string };
}

const ListingCard = ({ id, name, category, daily_rate, location, available_qty, avg_rating, total_reviews, lister }: ListingCardProps) => {
  return (
    <Link to={`/listings/${id}`} className="group block">
      <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Category banner */}
        <div className="gradient-hero h-36 flex items-center justify-center relative">
          <span className="text-5xl">{categoryIcons[category] || '🏅'}</span>
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
            ₹{daily_rate}/day
          </div>
          {available_qty <= 1 && (
            <div className="absolute top-3 left-3 bg-warning/90 text-secondary text-xs font-semibold px-2.5 py-1 rounded-full">
              Only {available_qty} left
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{name}</h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin size={14} />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} className="fill-primary text-primary" />
              <span className="font-medium text-foreground">{avg_rating || '—'}</span>
              {total_reviews !== undefined && (
                <span className="text-muted-foreground">({total_reviews})</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">by {lister.name}</span>
              {lister.phone && (
                <span className="text-xs text-muted-foreground block">📞 {lister.phone}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
