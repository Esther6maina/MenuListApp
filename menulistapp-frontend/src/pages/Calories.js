import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Calories = () => {
  const [day, setDay] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your data.');
          return;
        }

        const response = await axios.get(`http://localhost:3000/api/data/${day}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeals(response.data.meals || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch calorie data');
      }
    };

    fetchData();
  }, [day]);

  const handleDayChange = (e) => {
    setDay(e.target.value);
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="main-content">
      <h2>Calories</h2>
      <div>
        <label>Select Day: </label>
        <input type="date" value={day} onChange={handleDayChange} />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="meal-section">
        <h3>Meals</h3>
        <ul className="meal-list">
          {meals.map((meal, index) => (
            <li key={index}>
              <div className="item-content">
                <span>{meal.description} - {meal.calories} kcal</span>
              </div>
              <span className="timestamp">{new Date(meal.timestamp).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="totals">
        Total Calories: {totalCalories} kcal
      </div>
    </div>
  );
};

export default Calories;