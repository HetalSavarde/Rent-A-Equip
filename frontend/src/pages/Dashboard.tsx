import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import ReviewStars from '@/components/ReviewStars';
import ReviewDialog from '@/components/ReviewDialog';
import DamageReportDialog from '@/components/DamageReportDialog';
import { useAuth } from '@/contexts/AuthContext';
import { rentalService, listingService, listerRequestService, fineService, reviewService } from '@/lib/api-services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Package, AlertTriangle, User, Check, X, Phone } from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 1. DATA STATE (Crucial for fixing your errors)
  const [rentals, setRentals] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [fines, setFines] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [borrowerFilter, setBorrowerFilter] = useState('all');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewListing, setReviewListing] = useState('');
  const [damageOpen, setDamageOpen] = useState(false);
  const [damageListing, setDamageListing] = useState('');

  // 2. FETCH DATA FROM BACKEND
useEffect(() => {
  if (!isAuthenticated) return;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // We use the SPECIFIC function names from your api-services.ts
      const [rentalsRes, listingsRes, requestsRes, finesRes, reviewsRes] = await Promise.all([
        rentalService.getMyRentals(),        // Fix: was .getAll()
        listerRequestService.getMyListings(),// Fix: was .getAll()
        listerRequestService.getIncomingRequests(), // Correct function name
        fineService.getMyFines(),           // Fix: was .getAll()
        reviewService.getMyReviews()         // Fix: was .getAll()
      ]);

      // Map the data coming back from Axios
      setRentals(rentalsRes.data || []);
      setMyListings(listingsRes.data || []);
      setIncomingRequests(requestsRes.data || []);
      setFines(finesRes.data || []);
      setReviews(reviewsRes.data || []);

    } catch (error) {
      console.error("Dashboard data fetch failed:", error);
      toast({ 
        title: "Sync Error", 
        description: "Could not fetch data from the database.",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, [isAuthenticated]);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // 3. LOGIC FOR FILTERING
  const filteredRentals = borrowerFilter === 'all' 
    ? rentals 
    : rentals.filter(r => r.status === borrowerFilter);

  const unpaidFinesCount = fines.filter(f => f.status === 'unpaid').length;

  const handleProfileSave = () => {
    updateProfile({ name: profileName, phone: profilePhone });
    toast({ title: 'Profile updated!' });
  };

  if (loading) return <div className="flex justify-center p-20">Loading your dashboard...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">Welcome back, {user?.name}</p>

        <Tabs defaultValue="borrower" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-lg">
            <TabsTrigger value="borrower">As Borrower</TabsTrigger>
            <TabsTrigger value="lister">As Lister</TabsTrigger>
            <TabsTrigger value="fines">
              My Fines
              {unpaidFinesCount > 0 && (
                <span className="ml-1.5 bg-overdue text-primary-foreground text-xs w-5 h-5 rounded-full inline-flex items-center justify-center">
                  {unpaidFinesCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          {/* BORROWER TAB */}
          <TabsContent value="borrower" className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'active', 'returned', 'overdue', 'cancelled'].map((s) => (
                <button
                  key={s}
                  onClick={() => setBorrowerFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                    borrowerFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {filteredRentals.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package size={48} className="mx-auto mb-3 opacity-40" />
                <p>No rentals found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRentals.map((rental) => (
                  <div key={rental.id} className="bg-card border rounded-lg p-5 flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{rental.listing_name}</h3>
                      <p className="text-sm text-muted-foreground">from {rental.lister_name}</p>
                    </div>
                    <StatusBadge status={rental.status} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* LISTER TAB */}
          <TabsContent value="lister" className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">My Listings</h2>
                <Button size="sm" onClick={() => navigate('/listings/new')}>+ New Listing</Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {myListings.map((listing) => (
                  <div key={listing.id} className="bg-card border rounded-lg p-5 space-y-3">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{listing.name}</h3>
                      <StatusBadge status={listing.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{listing.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/listings/${listing.id}/edit`)}>Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* FINES TAB */}
          <TabsContent value="fines" className="space-y-4">
            {fines.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground"><p>No fines!</p></div>
            ) : (
              fines.map((fine) => (
                <div key={fine.id} className="bg-card border rounded-lg p-5 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{fine.listing_name}</h3>
                    <p className="text-lg font-bold text-overdue">₹{fine.amount}</p>
                  </div>
                  <StatusBadge status={fine.status} />
                </div>
              ))
            )}
          </TabsContent>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-card border rounded-lg p-6 max-w-lg space-y-4">
              <Label>Full Name</Label>
              <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
              <Label>Phone</Label>
              <Input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} />
              <Button onClick={handleProfileSave}>Save Changes</Button>
            </div>
            <Button variant="outline" className="text-overdue" onClick={() => { logout(); navigate('/'); }}>Logout</Button>
          </TabsContent>
        </Tabs>
      </div>

      <ReviewDialog open={reviewOpen} onOpenChange={setReviewOpen} listingName={reviewListing} />
      <DamageReportDialog open={damageOpen} onOpenChange={setDamageOpen} listingName={damageListing} />
    </div>
  );
};

export default Dashboard;
