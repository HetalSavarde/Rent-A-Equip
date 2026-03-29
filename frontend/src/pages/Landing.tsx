import React, { useState, useEffect } from 'react'; // Add these
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import ListingCard from '@/components/ListingCard';
import { listingService } from '@/lib/api-services'; // Import your service
import { ArrowRight, Shield, Handshake, IndianRupee } from 'lucide-react';

const Landing = () => {
  // 1. Create state to hold real data from PostgreSQL
  interface Listing {
  id: string;
  name: string;
  category: string;
  daily_rate: number;
  location: string;
  image_url?: string;
  available_qty: number;
}

 const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);

  // 2. Fetch the data when the page loads
  useEffect(() => {
  const fetchListings = async () => {
    try {
      const response = await listingService.getAll();
      
      console.log("API response:", response); // 👈 Add this to see the shape

      // Handle both shapes: array directly, or { data: [] } wrapper
      const listings = Array.isArray(response) 
        ? response 
        : response.data ?? response.listings ?? [];
        
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

      {/* Hero Section - Keeping your styles! */}
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

      {/* How it works - No changes needed here */}
      <section className="py-20 bg-background">
        {/* ... (Keep your How It Works code here) */}
      </section>

      {/* Featured Listings - NOW DYNAMIC */}
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
              <p className="text-center col-span-full text-muted-foreground">Loading latest gear...</p>
            )}
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default Landing;
