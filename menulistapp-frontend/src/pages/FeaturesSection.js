import React from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaTint, FaRunning, FaFire, FaClock } from 'react-icons/fa';

const FeaturesSection = React.memo(() => {
  const features = [
    {
      title: 'Menu List',
      description: 'Track your daily meals and plan your nutrition effortlessly.',
      icon: <FaUtensils />,
      link: '/menulist',
    },
    {
      title: 'Hydration',
      description: 'Monitor your water intake to stay hydrated and healthy.',
      icon: <FaTint />,
      link: '/hydration',
    },
    {
      title: 'Fitness',
      description: 'Log your workouts and achieve your fitness goals.',
      icon: <FaRunning />,
      link: '/fitness',
    },
    {
      title: 'Calories',
      description: 'Keep track of your calorie intake for a balanced diet.',
      icon: <FaFire />,
      link: '/calories',
    },
    {
      title: 'Fasting',
      description: 'Manage your fasting schedule for better health.',
      icon: <FaClock />,
      link: '/fasting',
    },
  ];

  return (
    <section className="features-section">
      <span className="section-badge">Features</span>
      <h2>Explore Our Features</h2>
      <p className="features-subtitle">
        Discover tools to help you live a healthier lifestyle.
      </p>
      <div className="features-grid">
        {features.map((feature) => (
          <Link
            key={feature.title}
            to={feature.link}
            className="feature-card"
            aria-label={`Go to ${feature.title} page`}
          >
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
});

export default FeaturesSection;