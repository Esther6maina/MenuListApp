import React, { useState } from 'react';
import './Home.css';
import menuListImage from '../assets/menulist.jpg';
import hydrationImage from '../assets/hydration.jpg';
import fitnessImage from '../assets/fitness.jpg';
import caloriesImage from '../assets/calories.jpg';
import fastingImage from '../assets/fasting.jpg';
import axios from 'axios';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');

  // Handle recipe search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) {
      setError('Please enter a search query');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to search for recipes');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/spoonacular/search', {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });

      setRecipes(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch recipes');
      setRecipes([]);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <h1>Food Tracker</h1>
        <p>Effortlessly track your meals, hydration, fitness, and fasting to achieve your wellness goals.</p>
        <div className="hero-buttons">
          <a href="/signup" className="cta-button primary">Get Started</a>
          <a href="/login" className="cta-button secondary">Log In</a>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Explore Our Features</h2>
        <div className="features-grid">
          {/* Menu List Feature */}
          <div className="feature-card">
            <img src={menuListImage} alt="Menu List" className="feature-image" />
            <h3>Menu List</h3>
            <p>
              Organize your daily meals with ease. Categorize your intake into Breakfast, Lunch, Dinner, and Snacks to maintain a balanced diet and stay on top of your nutrition goals.
            </p>
          </div>

          {/* Hydration Feature */}
          <div className="feature-card">
            <img src={hydrationImage} alt="Hydration" className="feature-image" />
            <h3>Hydration</h3>
            <p>
              Stay hydrated by logging your water intake. Monitor your daily hydration levels to ensure you’re meeting your body’s needs for optimal health and energy.
            </p>
          </div>

          {/* Fitness Feature */}
          <div className="feature-card">
            <img src={fitnessImage} alt="Fitness" className="feature-image" />
            <h3>Fitness</h3>
            <p>
              Track your physical activities, from cardio to strength training. Log your workouts to measure progress and maintain an active lifestyle effortlessly.
            </p>
          </div>

          {/* Calories Feature */}
          <div className="feature-card">
            <img src={caloriesImage} alt="Calories" className="feature-image" />
            <h3>Calories</h3>
            <p>
              Monitor your calorie intake with precision. Keep a detailed record of your meals to ensure you’re meeting your dietary goals, whether for weight loss or maintenance.
            </p>
          </div>

          {/* Fasting Feature */}
          <div className="feature-card">
            <img src={fastingImage} alt="Fasting" className="feature-image" />
            <h3>Fasting</h3>
            <p>
              Manage your fasting schedule with confidence. Log your fasting periods to support your intermittent fasting journey and improve your metabolic health.
            </p>
          </div>
        </div>
      </section>

      {/* Recipe Search Section */}
      <section className="recipe-search-section">
        <h2>Search for Recipes</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter a food item (e.g., chicken)"
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <img src={recipe.image} alt={recipe.title} className="recipe-image" />
              <h3>{recipe.title}</h3>
              <p>Calories: {Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 0)} kcal</p>
              <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="recipe-link">
                View Recipe
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;