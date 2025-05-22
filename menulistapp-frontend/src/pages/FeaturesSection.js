import React from 'react';
import { Link } from 'react-router-dom';
import menulistImage from '../assets/menulist.jpg';
import hydrationImage from '../assets/hydration.jpg';
import fitnessImage from '../assets/fitness.jpg';
import caloriesImage from '../assets/calories.jpg';
import fastingImage from '../assets/fasting.jpg';
import './FeaturesSection.css';

const FeaturesSection = React.memo(() => {
  const features = [
    {
      title: 'MenuList',
      description: 'Track your meals easily with our app',
      link: '/menulist',
      image: menulistImage,
      imagePosition: 'left',
    },
    {
      title: 'Hydration',
      description: 'Monitor your water intake daily',
      link: '/hydration',
      image: hydrationImage,
      imagePosition: 'right',
    },
    {
      title: 'Fitness',
      description: 'Log your workouts effortlessly',
      link: '/fitness',
      image: fitnessImage,
      imagePosition: 'left',
    },
    {
      title: 'Calories',
      description: 'Count your calories accurately',
      link: '/calories',
      image: caloriesImage,
      imagePosition: 'right',
    },
    {
      title: 'Fasting',
      description: 'Manage your fasting schedule',
      link: '/fasting',
      image: fastingImage,
      imagePosition: 'left',
    },
  ];

  return (
    <section className="features-section">
      <h2>Choose Your Focus</h2>
      <div className="features-grid">
        {features.map((feature) => (
          <div
            key={feature.title}
            className={`feature-card ${feature.imagePosition === 'right' ? 'image-right' : 'image-left'}`}
          >
            <img
              src={feature.image}
              alt={feature.title}
              className="feature-image"
              onError={(e) => (e.target.src = 'https://via.placeholder.com/150?text=' + feature.title)}
            />
            <div className="feature-content">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link to={feature.link} className="feature-button">Get Started</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

export default FeaturesSection;