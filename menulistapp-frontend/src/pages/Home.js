import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaSignInAlt, FaList } from 'react-icons/fa';
import './Home.css';

// Lazy load the sections
const FeaturesSection = React.lazy(() => import('./FeaturesSection'));
const RecipeSearchSection = React.lazy(() => import('./RecipeSearchSection'));

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">Achieve Your Wellness Goals</span>
          <h1>
            Transform Your <span>Health Journey</span>
          </h1>
          <p>Track meals, hydration, fitness, and fasting with ease to live your healthiest life.</p>
          <div className="hero-buttons">
            <Link to="/signup" className="cta-button primary" aria-label="Start tracking your health journey">
              Start Now <FaArrowRight />
            </Link>
            <Link to="/login" className="cta-button secondary" aria-label="Log in to your account">
              Log In <FaSignInAlt />
            </Link>
            <Link to="/menulist" className="cta-button secondary" aria-label="View your menu list">
              View Menu List <FaList />
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">100+</span>
              <span className="hero-stat-label">Healthy Recipes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Lazy-loaded sections with fallback */}
      <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
        <FeaturesSection />
        <RecipeSearchSection />
      </Suspense>
    </div>
  );
};

export default Home;