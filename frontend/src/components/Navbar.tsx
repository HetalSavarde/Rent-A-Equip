import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-secondary text-secondary-foreground sticky top-0 z-50 border-b border-navy-light">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold tracking-tight">
          <span className="text-primary">Rent</span>-A-Equip
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-secondary-foreground/80 hover:text-primary transition-colors">
            Home
           </Link>
           
          <Link to="/browse" className="text-sm font-medium text-secondary-foreground/80 hover:text-primary transition-colors">
            Browse
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-secondary-foreground/80 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-secondary-foreground/80 hover:text-primary">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-secondary-foreground/80 hover:text-white">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-orange-dark">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-secondary-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-secondary border-t border-navy-light px-4 pb-4 space-y-2">
          <Link 
            to="/" 
           className="block py-2 text-sm text-secondary-foreground/80" 
           onClick={() => setMobileOpen(false)}
           >
            Home
          </Link>
          <Link to="/browse" className="block py-2 text-sm text-secondary-foreground/80" onClick={() => setMobileOpen(false)}>Browse</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="block py-2 text-sm text-secondary-foreground/80" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button className="block py-2 text-sm text-secondary-foreground/80" onClick={() => { handleLogout(); setMobileOpen(false); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-sm text-secondary-foreground/80" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="block py-2 text-sm text-primary font-medium" onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
