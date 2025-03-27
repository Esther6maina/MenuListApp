// import React from 'react';
// import './Home.css';
// import menuListImage from '../assets/menulist.jpg'; // Placeholder for Menu List image
// import hydrationImage from '../assets/hydration.jpg'; // Placeholder for Hydration image
// import fitnessImage from '../assets/fitness.jpg'; // Placeholder for Fitness image
// import caloriesImage from '../assets/calories.jpg'; // Placeholder for Calories image
// import fastingImage from '../assets/fasting.jpg'; // Placeholder for Fasting image

// const Home = () => {
//   return (
//     <div className="home-page">
//       {/* Hero Section */}
//       <section className="hero-section">
//         <h1>Food Tracker</h1>
//         <p>Effortlessly track your meals, hydration, fitness, and fasting to achieve your wellness goals.</p>
//         <div className="hero-buttons">
//           <a href="/signup" className="cta-button primary">Get Started</a>
//           <a href="/login" className="cta-button secondary">Log In</a>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="features-section">
//         <h2>Explore Our Features</h2>
//         <div className="features-grid">
//           {/* Menu List Feature */}
//           <div className="feature-card">
//             <img src={menuListImage} alt="Menu List" className="feature-image" />
//             <h3>Menu List</h3>
//             <p>
//               Organize your daily meals with ease. Categorize your intake into Breakfast, Lunch, Dinner, and Snacks to maintain a balanced diet and stay on top of your nutrition goals.
//             </p>
//           </div>

//           {/* Hydration Feature */}
//           <div className="feature-card">
//             <img src={hydrationImage} alt="Hydration" className="feature-image" />
//             <h3>Hydration</h3>
//             <p>
//               Stay hydrated by logging your water intake. Monitor your daily hydration levels to ensure you’re meeting your body’s needs for optimal health and energy.
//             </p>
//           </div>

//           {/* Fitness Feature */}
//           <div className="feature-card">
//             <img src={fitnessImage} alt="Fitness" className="feature-image" />
//             <h3>Fitness</h3>
//             <p>
//               Track your physical activities, from cardio to strength training. Log your workouts to measure progress and maintain an active lifestyle effortlessly.
//             </p>
//           </div>

//           {/* Calories Feature */}
//           <div className="feature-card">
//             <img src={caloriesImage} alt="Calories" className="feature-image" />
//             <h3>Calories</h3>
//             <p>
//               Monitor your calorie intake with precision. Keep a detailed record of your meals to ensure you’re meeting your dietary goals, whether for weight loss or maintenance.
//             </p>
//           </div>

//           {/* Fasting Feature */}
//           <div className="feature-card">
//             <img src={fastingImage} alt="Fasting" className="feature-image" />
//             <h3>Fasting</h3>
//             <p>
//               Manage your fasting schedule with confidence. Log your fasting periods to support your intermittent fasting journey and improve your metabolic health.
//             </p>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Home;



import React from 'react';
import './Home.css';

const Home = () => {
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
            <img
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd"
              alt="Menu List"
              className="feature-image"
            />
            <h3>Menu List</h3>
            <p>
              Organize your daily meals with ease. Categorize your intake into Breakfast, Lunch, Dinner, and Snacks to maintain a balanced diet and stay on top of your nutrition goals.
            </p>
          </div>

          {/* Hydration Feature */}
          <div className="feature-card">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
              alt="Hydration"
              className="feature-image"
            />
            <h3>Hydration</h3>
            <p>
              Stay hydrated by logging your water intake. Monitor your daily hydration levels to ensure you’re meeting your body’s needs for optimal health and energy.
            </p>
          </div>

          {/* Fitness Feature */}
          <div className="feature-card">
            <img
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438"
              alt="Fitness"
              className="feature-image"
            />
            <h3>Fitness</h3>
            <p>
              Track your physical activities, from cardio to strength training. Log your workouts to measure progress and maintain an active lifestyle effortlessly.
            </p>
          </div>

          {/* Calories Feature */}
          <div className="feature-card">
            <img
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352"
              alt="Calories"
              className="feature-image"
            />
            <h3>Calories</h3>
            <p>
              Monitor your calorie intake with precision. Keep a detailed record of your meals to ensure you’re meeting your dietary goals, whether for weight loss or maintenance.
            </p>
          </div>

          {/* Fasting Feature */}
          <div className="feature-card">
            <img
              src="https://images.unsplash.com/photo-1505253710320-7922d4d3d2d5"
              alt="Fasting"
              className="feature-image"
            />
            <h3>Fasting</h3>
            <p>
              Manage your fasting schedule with confidence. Log your fasting periods to support your intermittent fasting journey and improve your metabolic health.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;