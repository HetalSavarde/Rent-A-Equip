import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ListingCard from '@/components/ListingCard';
import { mockListings, categories } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

const Browse = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);

  const filtered = useMemo(() => {
    return mockListings.filter((l) => {
      if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== 'all' && l.category !== category) return false;
      if (availableOnly && l.available_qty === 0) return false;
      return true;
    });
  }, [search, category, availableOnly]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Browse Equipment</h1>

        {/* Filters */}
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

        {/* Results */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No equipment found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}

        {/* Pagination placeholder */}
        <div className="mt-10 text-center text-sm text-muted-foreground">
          Showing {filtered.length} of {mockListings.length} listings
        </div>
      </div>
    </div>
  );
};

export default Browse;
