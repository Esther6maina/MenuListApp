import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Replace useHistory with useNavigate

const AddFood = () => {
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [category, setCategory] = useState('Breakfast'); // Default to Breakfast
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!description.trim()) {
      setError('Description cannot be empty.');
      return;
    }
    const caloriesNum = parseInt(calories);
    if (isNaN(caloriesNum) || caloriesNum <= 0 || caloriesNum > 5000) {
      setError('Calories must be a positive number and less than 5000.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to add a meal.');
        return;
      }

      // Fetch existing data for the current day
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`http://localhost:3000/api/data/${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Add the new meal to the existing meals array
      const existingData = response.data;
      const newMeal = {
        category,
        description,
        calories: caloriesNum,
        timestamp: new Date(),
      };
      const updatedMeals = [...existingData.meals, newMeal];

      // Update the day's data with the new meal
      await axios.post(
        'http://localhost:3000/api/data',
        {
          meals: updatedMeals,
          water: existingData.water,
          activities: existingData.activities,
          fasting: existingData.fasting,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate('/menulist'); // Use navigate instead of history.push
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add meal');
    }
  };

  return (
    <div className="main-content">
      <h2>Add Food</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="add-meal-form">
        <div>
          <label>Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Calories (kcal):</label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack">Snack</option>
          </select>
        </div>
        <button type="submit">Add Meal</button>
      </form>
    </div>
  );
};

export default AddFood;