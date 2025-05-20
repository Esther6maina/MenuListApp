import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaHome, FaUtensils, FaTint, FaRunning, FaFire, FaClock, FaUser, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import './MealList.css';

const MealList = () => {
  const [meals, setMeals] = useState({ Breakfast: [], Lunch: [], Dinner: [], Snacks: [] });
  const [day, setDay] = useState('2025-05-15');
  const [selectedDay, setSelectedDay] = useState('Thursday');
  const [editingMeal, setEditingMeal] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCalories, setEditCalories] = useState('');
  const [addingMeal, setAddingMeal] = useState(null);
  const [newName, setNewName] = useState('');
  const [newCalories, setNewCalories] = useState('');
  const [autoFetchCalories, setAutoFetchCalories] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }
        const response = await axios.get(`/api/data/${day}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const mealsData = response.data.meals || [];
        setMeals({
          Breakfast: mealsData.filter((meal) => meal.category === 'Breakfast' && meal.dayOfWeek === selectedDay),
          Lunch: mealsData.filter((meal) => meal.category === 'Lunch' && meal.dayOfWeek === selectedDay),
          Dinner: mealsData.filter((meal) => meal.category === 'Dinner' && meal.dayOfWeek === selectedDay),
          Snacks: mealsData.filter((meal) => meal.category === 'Snacks' && meal.dayOfWeek === selectedDay),
        });
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load meals. Please try again.');
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    };
    fetchData();
  }, [day, selectedDay]);

  const handleAddMeal = (category) => {
    setAddingMeal(category);
    setNewName('');
    setNewCalories('');
    setAutoFetchCalories(false);
  };

  const handleSubmitNewMeal = async (e, category) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/data/${day}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existingMeals = response.data.meals || [];

      let calories = parseInt(newCalories);
      if (autoFetchCalories) {
        calories = newName.toLowerCase().includes('egg') ? 78 :
                  newName.toLowerCase().includes('bread') ? 215 :
                  newName.toLowerCase().includes('chicken') ? 165 : 100;
      }

      const newMeal = { category, name: newName, calories, dayOfWeek: selectedDay };
      const updatedMeals = [...existingMeals, newMeal];

      await axios.post(
        '/api/data',
        { meals: updatedMeals, day },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMeals((prev) => ({
        ...prev,
        [category]: [...prev[category], newMeal],
      }));
      setAddingMeal(null);
      setError('');
    } catch (err) {
      console.error('Error adding meal:', err);
      setError('Failed to add meal. Please try again.');
    }
  };

  const handleEditMeal = (category) => {
    setEditingMeal(category);
    const mealsInCategory = meals[category];
    setEditName(mealsInCategory.map(m => m.name).join(', '));
    setEditCalories(mealsInCategory.reduce((total, m) => total + m.calories, 0).toString());
  };

  const handleUpdateMeal = async (e, category) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/data/${day}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existingMeals = response.data.meals || [];

      const updatedMealsInCategory = editName.split(',').map((name, index) => ({
        category,
        name: name.trim(),
        calories: Math.round(parseInt(editCalories) / editName.split(',').length),
        dayOfWeek: selectedDay,
      }));

      const otherMeals = existingMeals.filter(m => m.category !== category || m.dayOfWeek !== selectedDay);
      const updatedMeals = [...otherMeals, ...updatedMealsInCategory];

      await axios.post(
        '/api/data',
        { meals: updatedMeals, day },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMeals((prev) => ({
        ...prev,
        [category]: updatedMealsInCategory,
      }));
      setEditingMeal(null);
      setError('');
    } catch (err) {
      console.error('Error updating meal:', err);
      setError('Failed to update meal. Please try again.');
    }
  };

  const handleDeleteMeal = async (category) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/data/${day}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existingMeals = response.data.meals || [];
      const updatedMeals = existingMeals.filter((m) => m.category !== category || m.dayOfWeek !== selectedDay);

      await axios.post(
        '/api/data',
        { meals: updatedMeals, day },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMeals((prev) => ({
        ...prev,
        [category]: [],
      }));
      setError('');
    } catch (err) {
      console.error('Error deleting meal:', err);
      setError('Failed to delete meal. Please try again.');
    }
  };

  const calculateTotalCalories = (category) => {
    return meals[category].reduce((total, meal) => total + meal.calories, 0);
  };

  const handleSearchRecipes = async () => {
    if (!searchQuery) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/spoonacular/search', {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Search results:', response.data);
    } catch (err) {
      console.error('Error searching recipes:', err);
      setError('Failed to search recipes. Please try again.');
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="menu-list-container">
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <button className="toggle-sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <Link to="/" className="sidebar-item"><FaHome /> {isSidebarOpen && 'Home'}</Link>
        <Link to="/menulist" className="sidebar-item active"><FaUtensils /> {isSidebarOpen && 'Menu List'}</Link>
        <Link to="/hydration" className="sidebar-item"><FaTint /> {isSidebarOpen && 'Hydration'}</Link>
        <Link to="/fitness" className="sidebar-item"><FaRunning /> {isSidebarOpen && 'Fitness'}</Link>
        <Link to="/calories" className="sidebar-item"><FaFire /> {isSidebarOpen && 'Calories'}</Link>
        <Link to="/fasting" className="sidebar-item"><FaClock /> {isSidebarOpen && 'Fasting'}</Link>
        <Link to="/account" className="sidebar-item"><FaUser /> {isSidebarOpen && 'Account'}</Link>
      </div>
      <div className="main-content">
        <div className="title-section">
          <h1 className="page-title">FOOD TRACKER</h1>
        </div>
        <h2 className="menu-title">Menu List</h2>
        <div className="controls">
          <div className="date-picker">
            <label htmlFor="day">Select Date:</label>
            <input
              type="date"
              id="day"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </div>
          <div className="right-boxes">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search for recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={handleSearchRecipes}><FaSearch /></button>
            </div>
            <div className="day-filter-box">
              <label>Filter by Day:</label>
              <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <h3 className="meals-title">Meals for {selectedDay}, {day}</h3>
        <table className="meal-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Meals</th>
              <th>Kcal</th>
              <th>Add</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((category) => (
              <tr key={category}>
                <td>{category}</td>
                <td>{meals[category].map(meal => meal.name).join(', ')}</td>
                <td>{calculateTotalCalories(category)}</td>
                <td>
                  <button onClick={() => handleAddMeal(category)}>
                    <FaPlus />
                  </button>
                </td>
                <td>
                  <button onClick={() => handleEditMeal(category)}>
                    <FaEdit />
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDeleteMeal(category)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {addingMeal && (
          <form onSubmit={(e) => handleSubmitNewMeal(e, addingMeal)}>
            <h3>Add Meal to {addingMeal}</h3>
            <input
              type="text"
              placeholder="Meal Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Calories"
              value={newCalories}
              onChange={(e) => setNewCalories(e.target.value)}
            />
            <label>
              <input
                type="checkbox"
                checked={autoFetchCalories}
                onChange={(e) => setAutoFetchCalories(e.target.checked)}
              />
              Auto-fetch Calories
            </label>
            <button type="submit">Add Meal</button>
          </form>
        )}
        {editingMeal && (
          <form onSubmit={(e) => handleUpdateMeal(e, editingMeal)}>
            <h3>Edit Meals for {editingMeal}</h3>
            <input
              type="text"
              placeholder="Updated Meal Names (comma-separated)"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Total Calories"
              value={editCalories}
              onChange={(e) => setEditCalories(e.target.value)}
            />
            <button type="submit">Update Meals</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MealList;