import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import ReviewDialog from '@/components/ReviewDialog';
import DamageReportDialog from '@/components/DamageReportDialog';
import { useAuth } from '@/contexts/AuthContext';
import { rentalService, listingService, listerRequestService, fineService, reviewService } from '@/lib/api-services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        if (user?.id) {
          const reviewsRes = await reviewService.getByUser(user.id);
          setReviews(reviewsRes.reviews || []);
        }

        const [rentalsRes, listingsRes, requestsRes, finesRes] = await Promise.all([
          rentalService.getMyBorrowingRentals(),
          listingService.getMy(),
          listerRequestService.getMyListingRequests(),
          fineService.getMyFinesAsBorrower(),
        ]);

        setRentals(Array.isArray(rentalsRes) ? rentalsRes : rentalsRes.data || []);
        setMyListings(Array.isArray(listingsRes) ? listingsRes : listingsRes.data || []);
        setIncomingRequests(Array.isArray(requestsRes) ? requestsRes : requestsRes.data || []);
        setFines(Array.isArray(finesRes) ? finesRes : finesRes.data || []);

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
      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
        <span>📅 {rental.start_date} → {rental.due_date}</span>
        <span>📦 Qty: {rental.quantity}</span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <StatusBadge status={rental.status} />
      {rental.status === 'pending' && (
        <Button size="sm" variant="outline"
          onClick={async () => {
            try {
              await rentalService.cancelBooking(rental.id);
              setRentals(prev =>
                prev.map(r => r.id === rental.id ? { ...r, status: 'cancelled' } : r)
              );
              toast({ title: 'Rental cancelled' });
            } catch {
              toast({ title: 'Failed to cancel', variant: 'destructive' });
            }
          }}>
          Cancel
        </Button>
      )}
    </div>
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
                {myListings.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground col-span-full">
                    <Package size={48} className="mx-auto mb-3 opacity-40" />
                    <p>No listings yet. Create your first one!</p>
                  </div>
                ) : (
                  myListings.map((listing) => (
                    <div key={listing.id} className="bg-card border rounded-lg p-5 space-y-3">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{listing.name}</h3>
                        <StatusBadge status={listing.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{listing.description}</p>
                      <p className="text-xs text-muted-foreground">₹{listing.daily_rate}/day · {listing.available_qty} units</p>
                      <div className="flex gap-2">
  <Button size="sm" variant="outline"
    onClick={() => navigate(`/listings/${listing.id}/edit`)}>
    Edit
  </Button>
  <Button size="sm" variant="outline"
    onClick={async () => {
      try {
        const isPaused = listing.is_paused;
        await listingService.pause(listing.id, !isPaused);
        setMyListings(prev =>
          prev.map(l => l.id === listing.id
            ? { ...l, is_paused: !isPaused, status: !isPaused ? 'paused' : 'active' }
            : l
          )
        );
        toast({ title: isPaused ? 'Listing resumed!' : 'Listing paused!' });
      } catch {
        toast({ title: 'Failed to update listing', variant: 'destructive' });
      }
    }}>
    {listing.is_paused ? 'Resume' : 'Pause'}
  </Button>
  <Button size="sm" variant="destructive"
    onClick={async () => {
      try {
        await listingService.delete(listing.id);
        setMyListings(prev => prev.filter(l => l.id !== listing.id));
        toast({ title: 'Listing deleted' });
      } catch {
        toast({ title: 'Cannot delete listing', variant: 'destructive' });
      }
    }}>
    Delete
  </Button>
</div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* INCOMING REQUESTS */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Incoming Requests</h2>
              {incomingRequests.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
               <p>No incoming requests yet</p>
              </div>
              ) : (
                <div className="space-y-3">
                  {incomingRequests.map((req) => (
                <div key={req.id} className="bg-card border rounded-lg p-5 flex justify-between items-center">
                <div className="space-y-1">
                   <p className="text-sm font-semibold">from {req.borrower_name || 'Unknown'}</p>
                   <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>📅 {req.start_date} → {req.due_date}</span>
                      <span>📦 Qty: {req.quantity}</span>
                      {req.borrower_phone && <span>📞 {req.borrower_phone}</span>}
                   </div>
                 </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={req.status} />
            {req.status === 'pending' && (
              <>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={async () => {
                    try {
                      await listerRequestService.acceptRequest(req.id);
                      setIncomingRequests(prev =>
                        prev.map(r => r.id === req.id ? { ...r, status: 'active' } : r)
                      );
                      toast({ title: 'Request accepted!' });
                    } catch {
                      toast({ title: 'Failed to accept', variant: 'destructive' });
                    }
                  }}>
                  ✓ Accept
                </Button>
                <Button size="sm" variant="outline" className="text-destructive border-destructive"
                  onClick={async () => {
                    try {
                      await listerRequestService.rejectRequest(req.id);
                      setIncomingRequests(prev =>
                        prev.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r)
                      );
                      toast({ title: 'Request rejected' });
                    } catch {
                      toast({ title: 'Failed to reject', variant: 'destructive' });
                    }
                  }}>
                  ✕ Reject
                </Button>
              </>
            )}
            {req.status === 'active' && (
              <Button size="sm" variant="outline"
                onClick={async () => {
                  try {
                    await listerRequestService.markReturned(req.id);
                    setIncomingRequests(prev =>
                      prev.map(r => r.id === req.id ? { ...r, status: 'returned' } : r)
                    );
                    toast({ title: 'Marked as returned!' });
                  } catch {
                    toast({ title: 'Failed to mark returned', variant: 'destructive' });
                  }
                }}>
                Returned
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>
          </TabsContent>

          {/* FINES TAB */}
          <TabsContent value="fines" className="space-y-4">
            {fines.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p>No fines! 🎉</p>
              </div>
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
            <Button variant="outline" className="text-overdue"
              onClick={() => { logout(); navigate('/'); }}>
              Logout
            </Button>
          </TabsContent>

        </Tabs>
      </div>

      <ReviewDialog open={reviewOpen} onOpenChange={setReviewOpen} listingName={reviewListing} />
      <DamageReportDialog open={damageOpen} onOpenChange={setDamageOpen} listingName={damageListing} />
    </div>
  );
};

export default Dashboard;