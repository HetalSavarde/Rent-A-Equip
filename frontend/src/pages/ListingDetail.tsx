import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ReviewStars from '@/components/ReviewStars';
import { mockListings, mockReviews, categoryIcons } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Star, Calendar, Package, User } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const ListingDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const listing = mockListings.find((l) => l.id === id);

  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Listing not found</h1>
          <Link to="/browse" className="text-primary mt-4 inline-block hover:underline">← Back to Browse</Link>
        </div>
      </div>
    );
  }

  const isOwnListing = user?.id === listing.lister.id;

  const handleBook = () => {
    if (!startDate || !dueDate) {
      toast({ title: 'Please select dates', variant: 'destructive' });
      return;
    }
    toast({ title: 'Booking request sent!', description: `Your request for ${listing.name} has been sent to ${listing.lister.name}.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/browse" className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">← Back to Browse</Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero image placeholder */}
            <div className="gradient-hero rounded-xl h-64 md:h-80 flex items-center justify-center">
              <span className="text-8xl">{categoryIcons[listing.category] || '🏅'}</span>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full capitalize">{listing.category}</span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star size={14} className="fill-primary text-primary" />
                  {listing.avg_rating} ({listing.total_reviews} reviews)
                </div>
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">{listing.name}</h1>
              <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                <MapPin size={16} />
                {listing.location}
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6 space-y-3">
              <h2 className="font-display text-lg font-semibold text-foreground">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
              <div className="flex gap-6 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package size={16} />
                  {listing.available_qty} available
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} />
                  Listed {new Date(listing.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Reviews</h2>
              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-foreground">{review.reviewer.name}</span>
                      <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <ReviewStars rating={review.rating} size={14} />
                    <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price card */}
            <div className="bg-card rounded-lg border p-6 sticky top-24">
              <div className="text-3xl font-display font-bold text-foreground mb-1">
                ₹{listing.daily_rate}<span className="text-base font-normal text-muted-foreground">/day</span>
              </div>

              {!isAuthenticated ? (
                <div className="mt-6">
                  <Link to="/login">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-orange-dark">Login to Book</Button>
                  </Link>
                </div>
              ) : isOwnListing ? (
                <div className="mt-6 p-3 bg-muted rounded-lg text-center text-sm text-muted-foreground">
                  You cannot rent your own listing
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div>
                    <Label className="text-sm">Quantity (max {listing.available_qty})</Label>
                    <Input type="number" min={1} max={listing.available_qty} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label className="text-sm">Start Date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm">Due Date</Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                  <Button onClick={handleBook} className="w-full bg-primary text-primary-foreground hover:bg-orange-dark">
                    Book Now
                  </Button>
                </div>
              )}
            </div>

            {/* Lister card */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3">Listed by</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <User size={20} className="text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{listing.lister.name}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={12} className="fill-primary text-primary" />
                    <span className="text-muted-foreground">{listing.lister.avg_rating} rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
