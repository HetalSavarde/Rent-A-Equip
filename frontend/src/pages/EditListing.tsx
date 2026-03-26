import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { mockListerListings } from '@/lib/mock-data';

const categories = ['cricket', 'football', 'badminton', 'cycling', 'swimming', 'tennis', 'yoga', 'boxing'];

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    available_qty: '',
    daily_rate: '',
    location: '',
    phone: '',
    image_url: '',
  });

  useEffect(() => {
    const listing = mockListerListings.find((l) => l.id === id);
    if (listing) {
      setForm({
        name: listing.name,
        category: listing.category,
        description: listing.description,
        available_qty: String(listing.available_qty),
        daily_rate: String(listing.daily_rate),
        location: listing.location,
        phone: listing.lister.phone || '',
        image_url: '',
      });
    }
  }, [id]);

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) {
      toast({ title: 'Please select a category', variant: 'destructive' });
      return;
    }
    setLoading(true);
    // Mock PUT /api/listings/:id
    await new Promise((r) => setTimeout(r, 500));
    toast({ title: 'Listing updated successfully!' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Edit Listing</h1>
        <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-6 space-y-5">
          <div>
            <Label>Name *</Label>
            <Input required value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div>
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={(v) => update('category', v)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description *</Label>
            <Textarea required value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Available Quantity *</Label>
              <Input type="number" required min={1} value={form.available_qty} onChange={(e) => update('available_qty', e.target.value)} />
            </div>
            <div>
              <Label>Daily Rate (₹) *</Label>
              <Input type="number" required min={1} value={form.daily_rate} onChange={(e) => update('daily_rate', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Location *</Label>
            <Input required value={form.location} onChange={(e) => update('location', e.target.value)} />
          </div>
          <div>
            <Label>Phone Number *</Label>
            <Input required value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>
          <div>
            <Label>Image URL (optional)</Label>
            <Input value={form.image_url} onChange={(e) => update('image_url', e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-orange-dark">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditListing;
