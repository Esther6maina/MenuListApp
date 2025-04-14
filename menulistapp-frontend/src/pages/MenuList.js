import React, { useState, useEffect } from 'react';
import './MenuList.css'; 
import axios from 'axios';

const MenuList = () => {
  const [day, setDay] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [data, setData] = useState({ meals: [], activities: [], water: [], fasting: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true while fetching
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your data.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:3000/api/data/${day}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data');
      } finally {
        setLoading(false); // Set loading to false after fetching
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
      <h2 className="page-title">Menu List</h2>
      <div className="date-picker">
        <label htmlFor="day-select">Select Day: </label>
        <input
          id="day-select"
          type="date"
          value={day}
          onChange={handleDayChange}
          max={new Date().toISOString().split('T')[0]} // Prevent future dates
        />
      </div>
      {error && <p className="error-message">{error}</p>}
      {loading && <p className="loading-message">Loading...</p>}

      <div className="grid-container">
        {/* Breakfast Section */}
        <div className="meal-section">
          <h3>Breakfast</h3>
          {breakfast.length > 0 ? (
            <ul className="meal-list">
              {breakfast.map((meal, index) => (
                <li key={index} className="list-item">
                  <div className="item-content">
                    <span>{meal.description} - {meal.calories} kcal</span>
                  </div>
                  <span className="timestamp">{new Date(meal.timestamp).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No breakfast entries for this day.</p>
          )}
        </div>

        {/* Lunch Section */}
        <div className="meal-section">
          <h3>Lunch</h3>
          {lunch.length > 0 ? (
            <ul className="meal-list">
              {lunch.map((meal, index) => (
                <li key={index} className="list-item">
                  <div className="item-content">
                    <span>{meal.description} - {meal.calories} kcal</span>
                  </div>
                  <span className="timestamp">{new Date(meal.timestamp).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No lunch entries for this day.</p>
          )}
        </div>

        {/* Dinner Section */}
        <div className="meal-section">
          <h3>Dinner</h3>
          {dinner.length > 0 ? (
            <ul className="meal-list">
              {dinner.map((meal, index) => (
                <li key={index} className="list-item">
                  <div className="item-content">
                    <span>{meal.description} - {meal.calories} kcal</span>
                  </div>
                  <span className="timestamp">{new Date(meal.timestamp).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No dinner entries for this day.</p>
          )}
        </div>

        {/* Snack Section */}
        <div className="meal-section">
          <h3>Snack</h3>
          {snack.length > 0 ? (
            <ul className="meal-list">
              {snack.map((meal, index) => (
                <li key={index} className="list-item">
                  <div className="item-content">
                    <span>{meal.description} - {meal.calories} kcal</span>
                  </div>
                  <span className="timestamp">{new Date(meal.timestamp).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No snack entries for this day.</p>
          )}
        </div>

        {/* Activities Section */}
        <div className="activity-section">
          <h3>Activities</h3>
          {data.activities.length > 0 ? (
            <ul className="activity-list">
              {data.activities.map((activity, index) => (
                <li key={index} className="list-item">
                  <div className="item-content">
                    <span>{activity.description} - {activity.duration} mins</span>
                  </div>
                  <span className="timestamp">{new Date(activity.timestamp).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No activities for this day.</p>
          )}
        </div>

        {/* Hydration Section */}
        <div className="hydration-section">
          <h3>Hydration</h3>
          {data.water.length > 0 ? (
            <ul className="water-list">
              {data.water.map((entry, index) => (
                <li key={index} className="list-item">
                  <div className="item-content">
                    <span>{entry.amount} ml</span>
                  </div>
                  <span className="timestamp">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No hydration entries for this day.</p>
          )}
        </div>

        {/* Fasting Section */}
        <div className="fasting-section">
          <h3>Fasting</h3>
          {data.fasting.length > 0 ? (
            <ul className="fasting-list">
              {data.fasting.map((fast, index) => (
                <li key={index} className="list-item">
                  <div className="item-content">
                    <span>{fast.duration} hours</span>
                  </div>
                  <span className="timestamp">{new Date(fast.timestamp).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No fasting entries for this day.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuList;