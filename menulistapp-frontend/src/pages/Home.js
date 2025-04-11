import React, { useState } from 'react';
import './Home.css';
import menuListImage from '../assets/menulist.jpg';
import hydrationImage from '../assets/hydration.jpg';
import fitnessImage from '../assets/fitness.jpg';
import caloriesImage from '../assets/calories.jpg';
import fastingImage from '../assets/fasting.jpg';
// import heroBackground from '../assets/hero-background.jpg'; // Add this line
import axios from 'axios';

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState('');

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
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <span className="hero-badge">Achieve Your Wellness Goals</span>
                    <h1>Transform Your <span>Health Journey</span></h1>
                    <p>Track meals, hydration, fitness, and fasting with ease to live your healthiest life.</p>
                    <div className="hero-buttons">
                        <a href="/signup" className="cta-button primary">
                            Start Now <i className="fas fa-arrow-right"></i>
                        </a>
                        <a href="/login" className="cta-button secondary">
                            Log In <i className="fas fa-sign-in-alt"></i>
                        </a>
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
                <span className="section-badge">Features</span>
                <h2>Powerful Tools for Your Wellness</h2>
                <p className="features-subtitle">Discover how Food Tracker can help you stay on top of your health goals.</p>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-list"></i>
                        </div>
                        <div className="feature-image-container">
                            <img src={menuListImage} alt="Menu List" className="feature-image" />
                            <div className="feature-image-overlay"></div>
                        </div>
                        <h3>Menu List</h3>
                        <p>Organize meals into Breakfast, Lunch, Dinner, and Snacks.</p>
                        <a href="/menulist" className="feature-link">
                            Learn More <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-tint"></i>
                        </div>
                        <div className="feature-image-container">
                            <img src={hydrationImage} alt="Hydration" className="feature-image" />
                            <div className="feature-image-overlay"></div>
                        </div>
                        <h3>Hydration</h3>
                        <p>Log water intake to stay hydrated and energized.</p>
                        <a href="/hydration" className="feature-link">
                            Learn More <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-running"></i>
                        </div>
                        <div className="feature-image-container">
                            <img src={fitnessImage} alt="Fitness" className="feature-image" />
                            <div className="feature-image-overlay"></div>
                        </div>
                        <h3>Fitness</h3>
                        <p>Track workouts to maintain an active lifestyle.</p>
                        <a href="/fitness" className="feature-link">
                            Learn More <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-fire"></i>
                        </div>
                        <div className="feature-image-container">
                            <img src={caloriesImage} alt="Calories" className="feature-image" />
                            <div className="feature-image-overlay"></div>
                        </div>
                        <h3>Calories</h3>
                        <p>Monitor calorie intake to meet dietary goals.</p>
                        <a href="/calories" className="feature-link">
                            Learn More <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="feature-image-container">
                            <img src={fastingImage} alt="Fasting" className="feature-image" />
                            <div className="feature-image-overlay"></div>
                        </div>
                        <h3>Fasting</h3>
                        <p>Manage fasting schedules for better health.</p>
                        <a href="/fasting" className="feature-link">
                            Learn More <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </section>

            <section className="recipe-search-section">
                <h2>Discover Healthy Recipes</h2>
                <p className="recipe-search-description">Search for recipes that fit your dietary preferences and goals.</p>
                <form onSubmit={handleSearch} className="search-form">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search recipes (e.g., chicken salad)"
                        className="search-input"
                    />
                    <button type="submit" className="search-button">
                        Search <i className="fas fa-arrow-right"></i>
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
                <div className="recipes-grid">
                    {recipes.map((recipe) => (
                        <div key={recipe.id} className="recipe-card">
                            <img src={recipe.image} alt={recipe.title} className="recipe-image" />
                            <div className="recipe-content">
                                <h3>{recipe.title}</h3>
                                <p>Calories: {Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 0)} kcal</p>
                                <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="recipe-link">
                                    View Recipe <i className="fas fa-external-link-alt"></i>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;