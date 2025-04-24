// import React, { useState } from 'react';
// import './Home.css';
// import menuListImage from '../assets/menulist.jpg';
// import hydrationImage from '../assets/hydration.jpg';
// import fitnessImage from '../assets/fitness.jpg';
// import caloriesImage from '../assets/calories.jpg';
// import fastingImage from '../assets/fasting.jpg';
// import axios from 'axios';
// import { Link } from 'react-router-dom'; // Ensure this is imported

// const Home = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [recipes, setRecipes] = useState([]);
//   const [error, setError] = useState('');

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('http://localhost:3000/api/spoonacular/search', {
//         params: { query: searchQuery },
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setRecipes(response.data);
//       setError('');
//     } catch (err) {
//       setError('Failed to fetch recipes');
//     }
//   };

//   return (
//     <div>
//       {/* Hero Section */}
//       <section className="hero-section">
//         <div className="hero-overlay"></div>
//         <div className="hero-content">
//           <span className="hero-badge">Achieve Your Wellness Goals</span>
//           <h1>Transform Your <span>Health Journey</span></h1>
//           <p>Track meals, hydration, fitness, and fasting with ease to live your healthiest life.</p>
//           <div className="hero-buttons">
//             <Link to="/signup" className="cta-button primary">
//               Start Now <i className="fas fa-arrow-right"></i>
//             </Link>
//             <Link to="/login" className="cta-button secondary">
//               Log In <i className="fas fa-sign-in-alt"></i>
//             </Link>
//             <Link to="/menulist" className="cta-button secondary">
//               View Menu List <i className="fas fa-list"></i>
//             </Link>
//           </div>
//           <div className="hero-stats">
//             <div className="hero-stat">
//               <span className="hero-stat-value">100+</span>
//               <span className="hero-stat-label">Healthy Recipes</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="features-section">
//         <h2>Explore Our Features</h2>
//         <div className="features-grid">
//           <div className="feature-card">
//             <div className="feature-image-container">
//               <img src={menuListImage} alt="Menu List" />
//             </div>
//             <h3>Menu List</h3>
//             <p>Track your daily meals and plan your nutrition effortlessly.</p>
//           </div>
//           <div className="feature-card">
//             <div className="feature-image-container">
//               <img src={hydrationImage} alt="Hydration" />
//             </div>
//             <h3>Hydration</h3>
//             <p>Monitor your water intake to stay hydrated and healthy.</p>
//           </div>
//           <div className="feature-card">
//             <div className="feature-image-container">
//               <img src={fitnessImage} alt="Fitness" />
//             </div>
//             <h3>Fitness</h3>
//             <p>Log your workouts and achieve your fitness goals.</p>
//           </div>
//           <div className="feature-card">
//             <div className="feature-image-container">
//               <img src={caloriesImage} alt="Calories" />
//             </div>
//             <h3>Calories</h3>
//             <p>Keep track of your calorie intake for a balanced diet.</p>
//           </div>
//           <div className="feature-card">
//             <div className="feature-image-container">
//               <img src={fastingImage} alt="Fasting" />
//             </div>
//             <h3>Fasting</h3>
//             <p>Manage your fasting schedule for better health.</p>
//           </div>
//         </div>
//       </section>

//       {/* Recipe Search Section */}
//       <section className="recipe-search-section">
//         <h2>Search for Recipes</h2>
//         <form onSubmit={handleSearch} className="recipe-search-form">
//           <input
//             type="text"
//             placeholder="Search for recipes (e.g., chicken salad)"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//           <button type="submit">Search</button>
//         </form>
//         {error && <p style={{ color: 'red' }}>{error}</p>}
//         <div className="recipe-results">
//           {recipes.map((recipe, index) => (
//             <div key={index} className="recipe-card">
//               <h3>{recipe.title}</h3>
//               <p>Calories: {recipe.calories}</p>
//             </div>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Home;

// src/pages/Home.js
import React, { Suspense } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

// Lazy load the sections
const FeaturesSection = React.lazy(() => import('./FeaturesSection'));
const RecipeSearchSection = React.lazy(() => import('./RecipeSearchSection'));

const Home = () => {
  return (
    <div>
      {/* Hero Section (loaded immediately) */}
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

      {/* Lazy-loaded sections with fallback */}
      <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
        <FeaturesSection />
        <RecipeSearchSection />
      </Suspense>
    </div>
  );
};

export default Home;