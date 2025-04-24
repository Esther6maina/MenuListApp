// src/pages/FeaturesSection.js
import React from 'react';
import menuListImage from '../assets/menulist.jpg';
import hydrationImage from '../assets/hydration.jpg';
import fitnessImage from '../assets/fitness.jpg';
import caloriesImage from '../assets/calories.jpg';
import fastingImage from '../assets/fasting.jpg';

const FeaturesSection = React.memo(() => {
  return (
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
  );
});

export default FeaturesSection;