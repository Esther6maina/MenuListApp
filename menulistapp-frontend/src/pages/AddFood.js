import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddFood = () => {
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [category, setCategory] = useState('Breakfast');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/data/${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const existingData = response.data;
      const newMeal = {
        category,
        description,
        calories: caloriesNum,
        timestamp: new Date(),
      };
      const updatedMeals = [...existingData.meals, newMeal];

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/data`,
        {
          meals: updatedMeals,
          water: existingData.water,
          activities: existingData.activities,
          fasting: existingData.fasting,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate('/menulist');
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
          <select value={category}影响 onChange={(e) => setCategory(e.target.value)} required>
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