import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X, ArrowRight } from 'lucide-react';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import './PublicLayout.css';

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className={`public-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container public-nav">
          <Link to="/" className="public-logo" aria-label="E-Health Home">
            <img src="/Ehealthlogo.png" alt="E-Health" className="public-logo-image" style={{ height: 42, width: 'auto', objectFit: 'contain' }} />
          </Link>

          <nav className="public-nav-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About Us</Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
          </nav>

          <div className="public-nav-actions">
            <ThemeSwitcher size="sm" />
            <Link to="/login" className="btn btn-ghost btn-md hide-mobile">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-md hide-mobile">
              Get Started
            </Link>
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-nav-scrim" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-nav-dropdown">
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <div className="mobile-nav-buttons">
              <Link to="/login" className="btn btn-secondary btn-md w-full">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-md w-full">Get Started <ArrowRight size={16} /></Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
