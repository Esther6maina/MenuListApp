import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MenuList = () => {
  const [day, setDay] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [data, setData] = useState({ meals: [], activities: [], water: [], fasting: [] });
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
        setData(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data');
      }
    };

    fetchData();
  }, [day]);

  const handleDayChange = (e) => {
    setDay(e.target.value);
  };

  // Filter meals by category
  const breakfast = data.meals.filter(meal => meal.category === 'Breakfast');
  const lunch = data.meals.filter(meal => meal.category === 'Lunch');
  const dinner = data.meals.filter(meal => meal.category === 'Dinner');
  const snack = data.meals.filter(meal => meal.category === 'Snack');

  return (
    <div className="main-content">
      <h2>Menu List</h2>
      <div>
        <label>Select Day: </label>
        <input type="date" value={day} onChange={handleDayChange} />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="grid-container">
        {/* Breakfast Section */}
        <div className="meal-section">
          <h3>Breakfast</h3>
          <ul className="meal-list">
            {breakfast.map((meal, index) => (
              <li key={index}>
                <div className="item-content">
                  <span>{meal.description} - {meal.calories} kcal</span>
                </div>
                <span className="timestamp">{new Date(meal.timestamp).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lunch Section */}
        <div className="meal-section">
          <h3>Lunch</h3>
          <ul className="meal-list">
            {lunch.map((meal, index) => (
              <li key={index}>
                <div className="item-content">
                  <span>{meal.description} - {meal.calories} kcal</span>
                </div>
                <span className="timestamp">{new Date(meal.timestamp).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dinner Section */}
        <div className="meal-section">
          <h3>Dinner</h3>
          <ul className="meal-list">
            {dinner.map((meal, index) => (
              <li key={index}>
                <div className="item-content">
                  <span>{meal.description} - {meal.calories} kcal</span>
                </div>
                <span className="timestamp">{new Date(meal.timestamp).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Snack Section */}
        <div className="meal-section">
          <h3>Snack</h3>
          <ul className="meal-list">
            {snack.map((meal, index) => (
              <li key={index}>
                <div className="item-content">
                  <span>{meal.description} - {meal.calories} kcal</span>
                </div>
                <span className="timestamp">{new Date(meal.timestamp).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Activities Section */}
        <div className="activity-section">
          <h3>Activities</h3>
          <ul className="activity-list">
            {data.activities.map((activity, index) => (
              <li key={index}>
                <div className="item-content">
                  <span>{activity.description} - {activity.duration} mins</span>
                </div>
                <span className="timestamp">{new Date(activity.timestamp).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Hydration Section */}
        <div className="hydration-section">
          <h3>Hydration</h3>
          <ul className="water-list">
            {data.water.map((entry, index) => (
              <li key={index}>
                <div className="item-content">
                  <span>{entry.amount} ml</span>
                </div>
                <span className="timestamp">{new Date(entry.timestamp).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Fasting Section */}
        <div className="fasting-section">
          <h3>Fasting</h3>
          <ul className="fasting-list">
            {data.fasting.map((fast, index) => (
              <li key={index}>
                <div className="item-content">
                  <span>{fast.duration} hours</span>
                </div>
                <span className="timestamp">{new Date(fast.timestamp).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MenuList;