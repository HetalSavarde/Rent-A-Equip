import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import ReviewStars from '@/components/ReviewStars';
import ReviewDialog from '@/components/ReviewDialog';
import DamageReportDialog from '@/components/DamageReportDialog';
import { useAuth } from '@/contexts/AuthContext';
import { mockBorrowerRentals, mockListerListings, mockListerRequests, mockFines, mockReviews } from '@/lib/mock-data';
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

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [borrowerFilter, setBorrowerFilter] = useState('all');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewListing, setReviewListing] = useState('');
  const [damageOpen, setDamageOpen] = useState(false);
  const [damageListing, setDamageListing] = useState('');

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const filteredRentals = borrowerFilter === 'all'
    ? mockBorrowerRentals
    : mockBorrowerRentals.filter((r) => r.status === borrowerFilter);

  const handleProfileSave = () => {
    updateProfile({ name: profileName, phone: profilePhone });
    toast({ title: 'Profile updated!' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">Welcome back, {user?.name}</p>

        <Tabs defaultValue="borrower" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-lg">
            <TabsTrigger value="borrower" className="data-[state=active]:bg-card data-[state=active]:text-foreground rounded-md">
              As Borrower
            </TabsTrigger>
            <TabsTrigger value="lister" className="data-[state=active]:bg-card data-[state=active]:text-foreground rounded-md">
              As Lister
            </TabsTrigger>
            <TabsTrigger value="fines" className="data-[state=active]:bg-card data-[state=active]:text-foreground rounded-md">
              My Fines
              {mockFines.filter(f => f.status === 'unpaid').length > 0 && (
                <span className="ml-1.5 bg-overdue text-primary-foreground text-xs w-5 h-5 rounded-full inline-flex items-center justify-center">
                  {mockFines.filter(f => f.status === 'unpaid').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="lister-fines" className="data-[state=active]:bg-card data-[state=active]:text-foreground rounded-md"> 
               Lister Fines
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-card data-[state=active]:text-foreground rounded-md">
              My Profile
            </TabsTrigger>
          </TabsList>

          {/* BORROWER TAB */}
          <TabsContent value="borrower" className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'active', 'returned', 'overdue', 'cancelled'].map((s) => (
                <button
                  key={s}
                  onClick={() => setBorrowerFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                    borrowerFilter === s
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {filteredRentals.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package size={48} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No rentals found</p>
                <p className="text-sm mt-1">Browse equipment to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRentals.map((rental) => (
                  <div key={rental.id} className="bg-card border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">{rental.listing_name}</h3>
                      <p className="text-sm text-muted-foreground">from {rental.lister_name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {rental.start_date} → {rental.due_date}</span>
                        <span className="flex items-center gap-1"><Package size={12} /> Qty: {rental.quantity}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={rental.status} />
                      {rental.status === 'pending' && (
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => toast({ title: 'Request cancelled' })}>Cancel</Button>
                      )}
                      {rental.status === 'returned' && (
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => { setReviewListing(rental.listing_name); setReviewOpen(true); }}>Review</Button>
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
                <h2 className="font-display text-xl font-semibold text-foreground">My Listings</h2>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-orange-dark" onClick={() => navigate('/listings/new')}>
                  + New Listing
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {mockListerListings.map((listing) => (
                  <div key={listing.id} className="bg-card border rounded-lg p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{listing.name}</h3>
                      <StatusBadge status={listing.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{listing.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>₹{listing.daily_rate}/day · {listing.available_qty} units</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate(`/listings/${listing.id}/edit`)}>Edit</Button>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => toast({ title: listing.status === 'paused' ? 'Listing resumed' : 'Listing paused' })}>
                        {listing.status === 'paused' ? 'Resume' : 'Pause'}
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs text-overdue" onClick={() => toast({ title: 'Listing deleted' })}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incoming Requests */}
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">Incoming Requests</h2>
              <div className="space-y-3">
                {mockListerRequests.map((req) => (
                  <div key={req.id} className="bg-card border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">{req.listing_name}</h3>
                      <p className="text-sm text-muted-foreground">from {req.borrower_name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {req.start_date} → {req.due_date}</span>
                        <span className="flex items-center gap-1"><Package size={12} /> Qty: {req.quantity}</span>
                        <span className="flex items-center gap-1"><Phone size={12} /> {req.borrower_phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={req.status} />
                      {req.status === 'pending' && (
                        <>
                          <Button size="sm" className="bg-success text-primary-foreground text-xs" onClick={() => toast({ title: 'Request accepted!' })}>
                            <Check size={14} className="mr-1" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs text-overdue" onClick={() => toast({ title: 'Request rejected' })}>
                            <X size={14} className="mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {req.status === 'active' && (
                        <>
                          <Button size="sm" className="bg-primary text-primary-foreground text-xs" onClick={() => toast({ title: 'Marked as returned' })}>Returned</Button>
                          <Button size="sm" variant="outline" className="text-xs text-overdue" onClick={() => { setDamageListing(req.listing_name); setDamageOpen(true); }}>Report Damage</Button>
                        </>
                      )}
                      {req.fine_paid && (
                        <Button size="sm" className="bg-success text-primary-foreground text-xs" onClick={() => toast({ title: 'Fine marked as paid' })}>
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* FINES TAB */}
          <TabsContent value="fines" className="space-y-4">
            {mockFines.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <AlertTriangle size={48} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No unpaid fines — you're all clear!</p>
              </div>
            ) : (
              mockFines.map((fine) => (
                <div key={fine.id} className="bg-card border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{fine.listing_name}</h3>
                    <p className="text-sm text-muted-foreground">{fine.days_overdue} days overdue</p>
                    <p className="text-lg font-display font-bold text-overdue">₹{fine.amount}</p>
                  </div>
                  <StatusBadge status={fine.status} />
                </div>
              ))
            )}
            <p className="text-xs text-muted-foreground">Note: Payment is settled offline between Borrower and Lister.</p>
          </TabsContent>
          <TabsContent value="lister-fines" className="space-y-4">
             {mockFines.filter(fine => fine.lister_id === user?.id)
             .map((fine) => (
               <div key={fine.id} className="bg-card border rounded-lg p-5 flex justify-between items-center">
        
               <div>
                 <h3 className="font-semibold text-foreground">
                  {fine.listing_name}
                 </h3>

                 <p className="text-sm text-muted-foreground">
                   {fine.borrower_name} owes ₹{fine.amount}
                </p>

                  <p className="text-xs text-overdue">
                   {fine.days_overdue} days overdue
                 </p>
               </div>

                {fine.status === 'unpaid' ? (
               <Button
               size="sm"
               className="bg-success text-primary-foreground"
               onClick={() => alert("Payment confirmed")}
               >
                Mark as Paid
               </Button>
              ) : (
               <span className="text-green-500 text-sm font-medium">
                 Paid
              </span>
             )}

             </div>
           ))}
         </TabsContent>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-card border rounded-lg p-6 max-w-lg space-y-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <User size={32} className="text-secondary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">{user?.name}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div>
                <Label>Full Name</Label>
                <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} />
              </div>
              <Button onClick={handleProfileSave} className="bg-primary text-primary-foreground hover:bg-orange-dark">
                Save Changes
              </Button>
            </div>

            {/* Reviews */}
            <div className="bg-card border rounded-lg p-6 max-w-lg">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Reviews</h3>
              {mockReviews.slice(0, 2).map((rev) => (
                <div key={rev.id} className="border-b last:border-0 pb-3 last:pb-0 mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{rev.reviewer.name}</span>
                    <ReviewStars rating={rev.rating} size={12} />
                  </div>
                  <p className="text-sm text-muted-foreground">{rev.comment}</p>
                </div>
              ))}
            </div>

            <Button variant="outline" className="text-overdue border-overdue/30 hover:bg-overdue/10" onClick={() => { logout(); navigate('/'); }}>
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
