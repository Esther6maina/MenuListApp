import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import './AddFood.css';

const AddFood = () => {
  const { state } = useLocation();
  const { category, day } = state || {};
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get(`http://localhost:3000/api/data/${day}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existingMeals = response.data.meals || [];
      const newMeal = { category, name, calories: parseInt(calories) };
      const updatedMeals = [...existingMeals, newMeal];

      await axios.post(
        'http://localhost:3000/api/data',
        { meals: updatedMeals },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/menulist');
    } catch (err) {
      console.error('Error adding meal:', err);
      setError('Failed to add meal. Please try again.');
    }
  };

  return (
    <div className="add-food-container">
      <h2>Add Meal to {category}</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Meal Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., Oatmeal"
          />
        </div>
        <div className="form-group">
          <label>Calories (kcal)</label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            required
            placeholder="e.g., 150"
          />
        </div>
        <button type="submit">Add Meal</button>
      </form>
      <button className="cancel-button" onClick={() => navigate('/menulist')}>
        <FaTimes /> Cancel
      </button>
    </div>
  );
};

export default AddFood;