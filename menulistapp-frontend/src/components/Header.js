// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <FaUtensils className="logo-icon" />
        <span className="logo-text">Food Tracker</span>
      </div>
      <nav className="nav-menu">
        <Link to="/" className="nav-item">Home</Link>
        <Link to="/menulist" className="nav-item">MenuList</Link>
        <Link to="/hydration" className="nav-item">Hydration</Link>
        <Link to="/fitness" className="nav-item">Fitness</Link>
        <Link to="/calories" className="nav-item">Calories</Link>
        <Link to="/fasting" className="nav-item">Fasting</Link>
      </nav>
      <div className="nav-actions">
        <Link to="/signup" className="nav-button">Sign Up</Link>
        <Link to="/login" className="nav-button">Login</Link>
      </div>
    </header>
  );
};

export default Header;