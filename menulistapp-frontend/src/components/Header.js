import React, { useState, useEffect } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const history = useHistory();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    history.push('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className={`app-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="logo">
        <i className="fas fa-utensils"></i>
        <span>FOOD TRACKER</span>
      </div>
      <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          <i className="fas fa-home"></i> Home
        </Link>
        <Link to="/menulist" className={location.pathname === '/menulist' ? 'active' : ''}>
          <i className="fas fa-list"></i> Menu List
        </Link>
        <Link to="/hydration" className={location.pathname === '/hydration' ? 'active' : ''}>
          <i className="fas fa-tint"></i> Hydration
        </Link>
        <Link to="/fitness" className={location.pathname === '/fitness' ? 'active' : ''}>
          <i className="fas fa-running"></i> Fitness
        </Link>
        <Link to="/calories" className={location.pathname === '/calories' ? 'active' : ''}>
          <i className="fas fa-fire"></i> Calories
        </Link>
        <Link to="/fasting" className={location.pathname === '/fasting' ? 'active' : ''}>
          <i className="fas fa-clock"></i> Fasting
        </Link>
        {token && (
          <Link to="/accounts" className={location.pathname === '/accounts' ? 'active' : ''}>
            <i className="fas fa-user"></i> Account
          </Link>
        )}
      </nav>
      <div className="header-actions">
        {token ? (
          <button className="action-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        ) : (
          <>
            <Link to="/signup" className="action-btn signup-btn">
              <i className="fas fa-user-plus"></i> Sign Up
            </Link>
            <Link to="/login" className="action-btn">
              <i className="fas fa-sign-in-alt"></i> Login
            </Link>
          </>
        )}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
          <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>
    </header>
  );
};

export default Header;