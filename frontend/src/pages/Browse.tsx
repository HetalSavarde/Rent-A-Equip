import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import ListingCard from '@/components/ListingCard';
import { listingService } from '@/lib/api-services';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

const categories = [
  'cricket', 'football', 'badminton', 'tennis', 'skating',
  'cycling', 'yoga', 'boxing', 'swimming', 'basketball',
];

const Browse = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['listings', search, category, availableOnly],
    queryFn: () => listingService.getAll({
      search: search || undefined,
      category: category !== 'all' ? category : undefined,
      available: availableOnly || undefined,
    }),
  });

  const listings = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Browse Equipment</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Switch id="available" checked={availableOnly} onCheckedChange={setAvailableOnly} />
            <Label htmlFor="available" className="text-sm text-muted-foreground whitespace-nowrap">Available only</Label>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">Loading equipment...</p>
          </div>
        )}

        {isError && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium text-destructive">Failed to load listings</p>
            <p className="text-sm mt-1">Make sure the backend is running</p>
          </div>
        )}

        {!isLoading && !isError && listings.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing: any) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        )}

        {!isLoading && !isError && listings.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No equipment found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}

        {!isLoading && (
          <div className="mt-10 text-center text-sm text-muted-foreground">
            Showing {listings.length} of {total} listings
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;