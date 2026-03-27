import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import ListingCard from '@/components/ListingCard';
import { mockListings } from '@/lib/mock-data';
import { ArrowRight, Shield, Handshake, IndianRupee } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero text-secondary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6">
            Rent Sports Gear
            <span className="text-gradient-orange block">From People Near You</span>
          </h1>
          <p className="text-secondary-foreground/70 text-lg md:text-xl mb-10 max-w-xl mx-auto">
            Why buy when you can borrow? List your equipment. Rent what you need. Play more, spend less.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-orange-dark text-base px-8 w-full sm:w-auto">
                Get Started <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
            <Link to="/browse">
              <Button size="lg" variant="outline" className="border-secondary-foreground/30 text-secondary hover:bg-secondary-foreground/10 text-base px-8 w-full sm:w-auto">
                Browse Equipment
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-14 text-foreground">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Shield, title: 'List Your Gear', desc: 'Got equipment sitting idle? Create a listing in seconds and set your daily rate.' },
              { icon: Handshake, title: 'Get a Request', desc: 'Borrowers find your listing and send a rental request. Accept or decline — you\'re in control.' },
              { icon: IndianRupee, title: 'Earn Money', desc: 'Hand over the gear, earn rental income. It\'s that simple.' },
            ].map((step, i) => (
              <div key={i} className="text-center space-y-4 animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="w-16 h-16 rounded-2xl gradient-orange flex items-center justify-center mx-auto">
                  <step.icon className="text-primary-foreground" size={28} />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
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
            {mockListings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
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
