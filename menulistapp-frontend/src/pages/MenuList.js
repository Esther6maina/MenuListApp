import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './MenuList.css';

const MenuList = () => {
  const [meals, setMeals] = useState({ Breakfast: [], Lunch: [], Dinner: [], Snacks: [] });
  const [day, setDay] = useState(new Date().toISOString().split('T')[0]);
  const [editingMeal, setEditingMeal] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCalories, setEditCalories] = useState('');
  const [error, setError] = useState('');
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
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load meals. Please try again.');
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

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setEditName(meal.name);
    setEditCalories(meal.calories.toString());
  };

  const handleUpdateMeal = async (e, category) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/data/${day}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existingMeals = response.data.meals || [];
      const updatedMeals = existingMeals.map((m) =>
        m === editingMeal ? { ...m, name: editName, calories: parseInt(editCalories) } : m
      );

      await axios.post(
        'http://localhost:3000/api/data',
        { meals: updatedMeals },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMeals((prev) => ({
        ...prev,
        [category]: prev[category].map((m) =>
          m === editingMeal ? { ...m, name: editName, calories: parseInt(editCalories) } : m
        ),
      }));
      setEditingMeal(null);
      setError('');
    } catch (err) {
      console.error('Error updating meal:', err);
      setError('Failed to update meal. Please try again.');
    }
  };

  const handleDeleteMeal = async (meal, category) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/data/${day}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existingMeals = response.data.meals || [];
      const updatedMeals = existingMeals.filter((m) => m !== meal);

      await axios.post(
        'http://localhost:3000/api/data',
        { meals: updatedMeals },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMeals((prev) => ({
        ...prev,
        [category]: prev[category].filter((m) => m !== meal),
      }));
      setError('');
    } catch (err) {
      console.error('Error deleting meal:', err);
      setError('Failed to delete meal. Please try again.');
    }
  };

  return (
    <div className="menu-list-container">
      <h2 className="page-title">Menu List</h2>
      <div className="date-picker">
        <label htmlFor="day">Select Date:</label>
        <input
          type="date"
          id="day"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />
      </div>
      {error && <p className="error-message">{error}</p>}
      <h3 className="meals-title">Meals for {day}</h3>
      <div className="grid-container">
        {Object.keys(meals).map((category) => (
          <div key={category} className="meal-section">
            <h3>{category}</h3>
            <ul className="meal-list">
              {meals[category].length > 0 ? (
                meals[category].map((meal, index) => (
                  <li key={index} className="list-item">
                    {editingMeal === meal ? (
                      <form onSubmit={(e) => handleUpdateMeal(e, category)} className="edit-item-form">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          required
                          placeholder="Enter meal name"
                        />
                        <input
                          type="number"
                          value={editCalories}
                          onChange={(e) => setEditCalories(e.target.value)}
                          required
                          placeholder="Enter calories"
                        />
                        <button type="submit" className="save-button">Save</button>
                        <button type="button" className="cancel-button" onClick={() => setEditingMeal(null)}>
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <span className="item-content">
                          {meal.name} - {meal.calories} kcal
                        </span>
                        <div className="item-actions">
                          <button onClick={() => handleEditMeal(meal)} className="edit-button">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDeleteMeal(meal, category)} className="delete-button">
                            <FaTrash />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))
              ) : (
                <p className="no-data">No meals added.</p>
              )}
            </ul>
            <div className="add-meal">
              <button onClick={() => handleAddMeal(category)} className="add-button">
                <FaPlus /> Add Meal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuList;