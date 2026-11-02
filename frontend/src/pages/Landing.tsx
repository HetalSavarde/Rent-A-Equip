import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import ListingCard from '@/components/ListingCard';
import { listingService } from '@/lib/api-services';
import { ArrowRight, Shield, Handshake, IndianRupee } from 'lucide-react';

interface Listing {
  id: string;
  name: string;
  category: string;
  daily_rate: number;
  location: string;
  image_url?: string;
  phone?: string;
  available_qty: number;
  avg_rating?: number;
  total_reviews?: number;
  lister: { name: string; avg_rating: number; phone?: string };
}

const Landing = () => {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await listingService.getAll();
        // Backend returns { items: [], total, page, limit }
        const listings = response.items ?? [];
        setFeaturedListings(listings.slice(0, 3));
      } catch (error) {
        console.error("Failed to load listings:", error);
      }
    };
    fetchListings();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="gradient-hero text-secondary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6 text-white">
            Rent Sports Gear
            <span className="text-primary block">From People Near You</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-xl mx-auto">
            Why buy when you can borrow? List your equipment. Rent what you need. Play more, spend less.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-orange-dark text-base px-8 w-full sm:w-auto">
                Get Started <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
            <Link to="/browse">
              <Button size="lg" variant="outline" className="border-white/30 text-black hover:bg-white/10 text-base px-8 w-full sm:w-auto">
                Browse Equipment
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
                <Shield size={28} className="text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">List Your Gear</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Got equipment sitting idle? Create a listing in seconds and set your daily rate.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
                <Handshake size={28} className="text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Get a Request</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Borrowers find your listing and send a rental request. Accept or decline — you're in control.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
                <IndianRupee size={28} className="text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Earn Money</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Hand over the gear, earn rental income. It's that simple.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground">Featured Gear</h2>
            <Link to="/browse" className="text-primary font-medium text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.length > 0 ? (
              featuredListings.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))
            ) : (
              <p className="text-center col-span-full text-muted-foreground">
                Loading latest gear...
              </p>
            )}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground/60 py-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <span className="font-display font-bold text-lg">
                <span className="text-primary">Rent</span>-A-Equip
              </span>
              <p className="mt-2 text-sm">© 2026 Rent-A-Equip. Sports gear for everyone.</p>
            </div>
            <div className="md:text-right space-y-1">
              <h4 className="font-display font-semibold text-secondary-foreground text-sm mb-2">Contact</h4>
              <p className="text-sm">support@rentaequip.in</p>
              <p className="text-sm">+91 98XXXXXXXX</p>
              <p className="text-sm">Mumbai, India</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
