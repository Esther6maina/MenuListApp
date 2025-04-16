import React, { useState } from 'react';
import './Home.css';
import menuListImage from '../assets/menulist.jpg';
import hydrationImage from '../assets/hydration.jpg';
import fitnessImage from '../assets/fitness.jpg';
import caloriesImage from '../assets/calories.jpg';
import fastingImage from '../assets/fasting.jpg';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecipes([]);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to search for recipes.');
        setLoading(false);
        return;
      }
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/spoonacular/search`, {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes(response.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

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
            <Link to="/signup" className="cta-button primary">
              Start Now <i className="fas fa-arrow-right"></i>
            </Link>
            <Link to="/login" className="cta-button secondary">
              Log In <i className="fas fa-sign-in-alt"></i>
            </Link>
            <Link to="/menulist" className="cta-button secondary">
              View Menu List <i className="fas fa-list"></i>
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

      {/* Features Section */}
      <section className="features-section">
        <h2>Explore Our Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-image-container">
              <img
                src={menuListImage}
                alt="Menu List"
                loading="lazy"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/300?text=Menu+List')}
              />
            </div>
            <h3>Menu List</h3>
            <p>Track your daily meals and plan your nutrition effortlessly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-image-container">
              <img
                src={hydrationImage}
                alt="Hydration"
                loading="lazy"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/300?text=Hydration')}
              />
            </div>
            <h3>Hydration</h3>
            <p>Monitor your water intake to stay hydrated and healthy.</p>
          </div>
          <div className="feature-card">
            <div className="feature-image-container">
              <img
                src={fitnessImage}
                alt="Fitness"
                loading="lazy"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/300?text=Fitness')}
              />
            </div>
            <h3>Fitness</h3>
            <p>Log your workouts and achieve your fitness goals.</p>
          </div>
          <div className="feature-card">
            <div className="feature-image-container">
              <img
                src={caloriesImage}
                alt="Calories"
                loading="lazy"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/300?text=Calories')}
              />
            </div>
            <h3>Calories</h3>
            <p>Keep track of your calorie intake for a balanced diet.</p>
          </div>
          <div className="feature-card">
            <div className="feature-image-container">
              <img
                src={fastingImage}
                alt="Fasting"
                loading="lazy"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/300?text=Fasting')}
              />
            </div>
            <h3>Fasting</h3>
            <p>Manage your fasting schedule for better health.</p>
          </div>
        </div>
      </section>

      {/* Recipe Search Section */}
      <section className="recipe-search-section">
        <h2>Search for Recipes</h2>
        <form onSubmit={handleSearch} className="recipe-search-form">
          <input
            type="text"
            placeholder="Search for recipes (e.g., chicken salad)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        {loading && <div className="loading-spinner">Loading...</div>}
        <div className="recipe-results">
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <div key={recipe.id} className="recipe-card">
                <h3>{recipe.title}</h3>
                {recipe.nutrition?.nutrients?.find(n => n.name === 'Calories') ? (
                  <p>
                    Calories: {recipe.nutrition.nutrients.find(n => n.name === 'Calories').amount}{' '}
                    {recipe.nutrition.nutrients.find(n => n.name === 'Calories').unit}
                  </p>
                ) : (
                  <p>Calories: Not available</p>
                )}
              </div>
            ))
          ) : (
            !loading && <p className="no-results">No recipes found. Try a different search term!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;