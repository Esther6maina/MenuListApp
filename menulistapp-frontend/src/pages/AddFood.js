import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const AddFood = () => {
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [category, setCategory] = useState('Breakfast'); // Default to Breakfast
  const [error, setError] = useState('');
  const history = useHistory();

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

      await axios.post(
        'http://localhost:3000/api/meals',
        { description, calories: caloriesNum, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      history.push('/menulist'); // Redirect to MenuList page after adding
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