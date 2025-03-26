import React from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const history = useHistory();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    history.push('/login');
  };

  return (
    <header className="app-header">
      <div className="logo">
        <i className="fas fa-bars"></i>
        <span>FOOD TRACKER</span>
      </div>
      <nav className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
        <Link to="/menulist" className={location.pathname === '/menulist' ? 'active' : ''}>Menu List</Link>
        <Link to="/hydration" className={location.pathname === '/hydration' ? 'active' : ''}>Hydration</Link>
        <Link to="/fitness" className={location.pathname === '/fitness' ? 'active' : ''}>Fitness</Link>
        <Link to="/calories" className={location.pathname === '/calories' ? 'active' : ''}>Calories</Link>
        <Link to="/fasting" className={location.pathname === '/fasting' ? 'active' : ''}>Fasting</Link>
      </nav>
      <div className="header-actions">
        {token ? (
          <>
            <button className="action-btn" onClick={handleLogout}>Logout</button>
            <Link to="/accounts" className="action-btn">Accounts</Link>
          </>
        ) : (
          <>
            <Link to="/signup" className="action-btn signup-btn">Sign Up</Link>
            <Link to="/login" className="action-btn">Login</Link>
          </>
        )}
        <i className="fas fa-bars menu-icon"></i>
      </div>
    </header>
  );
};

export default Header;
