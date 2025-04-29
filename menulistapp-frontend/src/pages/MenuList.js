import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './MenuList.css';

const MenuList = () => {
  const [meals, setMeals] = useState({ Breakfast: [], Lunch: [], Dinner: [], Snacks: [] });
  const [day, setDay] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await axios.get(`http://localhost:3000/api/data/${day}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeals({
          Breakfast: response.data.meals.filter((meal) => meal.category === 'Breakfast'),
          Lunch: response.data.meals.filter((meal) => meal.category === 'Lunch'),
          Dinner: response.data.meals.filter((meal) => meal.category === 'Dinner'),
          Snacks: response.data.meals.filter((meal) => meal.category === 'Snacks'),
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchData();
  }, [day, navigate]);

  const handleAddMeal = (category) => {
    navigate('/add-food', { state: { category, day } });
  };

  return (
    <div className="menu-list-container">
      <h2>Menu List</h2>
      <div className="date-picker">
        <label htmlFor="day">Select Date: </label>
        <input
          type="date"
          id="day"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />
      </div>
      <h3>Meals for {day}</h3>
      {Object.keys(meals).map((category) => (
        <div key={category} className="category-section">
          <h3>{category}</h3>
          <ul>
            {meals[category].length > 0 ? (
              meals[category].map((meal, index) => (
                <li key={index}>
                  {meal.name} - {meal.calories} kcal
                </li>
              ))
            ) : (
              <p>No meals added.</p>
            )}
          </ul>
          <div className="add-meal">
            <button onClick={() => handleAddMeal(category)}>
              <FaPlus /> Add Meal
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuList;