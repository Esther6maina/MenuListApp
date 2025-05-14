import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaHome, FaUtensils, FaTint, FaRunning, FaFire, FaClock, FaUser, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import './MenuList.css';

const MenuList = () => {
  const [meals, setMeals] = useState({ Breakfast: [], Lunch: [], Dinner: [], Snacks: [] });
  const [day, setDay] = useState('2025-05-14'); // Set to current date
  const [selectedDay, setSelectedDay] = useState('Wednesday'); // Current day
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
        const response = await axios.get(`http://localhost:3000/api/data/${day}`, {
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
      const response = await axios.get(`http://localhost:3000/api/data/${day}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existingMeals = response.data.meals || [];

      let calories = parseInt(newCalories);
      if (autoFetchCalories) {
        calories = newName.toLowerCase().includes('egg') ? 78 :
                  newName.toLowerCase().includes('bread') ? 265 :
                  newName.toLowerCase().includes('chicken') ? 165 : 100; // Fallback
      }

      const newMeal = { category, name: newName, calories, dayOfWeek: selectedDay };
      const updatedMeals = [...existingMeals, newMeal];

      await axios.post(
        'http://localhost:3000/api/data',
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
      const response = await axios.get(`http://localhost:3000/api/data/${day}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existingMeals = response.data.meals || [];

      const updatedMealsInCategory = editName.split(',').map((name, index) => ({
        category,
        name: name.trim(),
        calories: Math.round(parseInt(editCalories) / editName.split(',').length), // Distribute calories evenly
        dayOfWeek: selectedDay,
      }));

      const otherMeals = existingMeals.filter(m => m.category !== category || m.dayOfWeek !== selectedDay);
      const updatedMeals = [...otherMeals, ...updatedMealsInCategory];

      await axios.post(
        'http://localhost:3000/api/data',
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
      const response = await axios.get(`http://localhost:3000/api/data/${day}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existingMeals = response.data.meals || [];
      const updatedMeals = existingMeals.filter((m) => m.category !== category || m.dayOfWeek !== selectedDay);

      await axios.post(
        'http://localhost:3000/api/data',
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
      const response = await axios.get('http://localhost:3000/api/spoonacular/search', {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Search results:', response.data); // For now, log the results
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
        <div className="sidebar-item"><FaHome /> {isSidebarOpen && 'Home'}</div>
        <div className="sidebar-item active"><FaUtensils /> {isSidebarOpen && 'Menu List'}</div>
        <div className="sidebar-item"><FaTint /> {isSidebarOpen && 'Hydration'}</div>
        <div className="sidebar-item"><FaRunning /> {isSidebarOpen && 'Fitness'}</div>
        <div className="sidebar-item"><FaFire /> {isSidebarOpen && 'Calories'}</div>
        <div className="sidebar-item"><FaClock /> {isSidebarOpen && 'Fasting'}</div>
        <div className="sidebar-item"><FaUser /> {isSidebarOpen && 'Account'}</div>
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
              <th>Add Items</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(meals).map((category) => (
              <tr key={category}>
                {addingMeal === category ? (
                  <td colSpan="6">
                    <form onSubmit={(e) => handleSubmitNewMeal(e, category)} className="add-item-form">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        placeholder="Enter meal name"
                      />
                      <div className="calories-input">
                        <label>
                          <input
                            type="checkbox"
                            checked={autoFetchCalories}
                            onChange={(e) => setAutoFetchCalories(e.target.checked)}
                          />
                          Auto-fetch calories
                        </label>
                        {!autoFetchCalories && (
                          <input
                            type="number"
                            value={newCalories}
                            onChange={(e) => setNewCalories(e.target.value)}
                            required
                            placeholder="Enter calories"
                          />
                        )}
                      </div>
                      <button type="submit" className="save-button">Add</button>
                      <button type="button" className="cancel-button" onClick={() => setAddingMeal(null)}>
                        Cancel
                      </button>
                    </form>
                  </td>
                ) : editingMeal === category ? (
                  <td colSpan="6">
                    <form onSubmit={(e) => handleUpdateMeal(e, category)} className="edit-item-form">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        placeholder="Enter meal names (comma-separated)"
                      />
                      <input
                        type="number"
                        value={editCalories}
                        onChange={(e) => setEditCalories(e.target.value)}
                        required
                        placeholder="Total calories"
                      />
                      <button type="submit" className="save-button">Save</button>
                      <button type="button" className="cancel-button" onClick={() => setEditingMeal(null)}>
                        Cancel
                      </button>
                    </form>
                  </td>
                ) : (
                  <>
                    <td>{category}</td>
                    <td>{meals[category].length > 0 ? meals[category].map(m => m.name).join(', ') : 'No meals'}</td>
                    <td>{calculateTotalCalories(category)} kcal</td>
                    <td>
                      <button onClick={() => handleAddMeal(category)} className="add-button">
                        <FaPlus />
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleEditMeal(category)} className="edit-button" disabled={meals[category].length === 0}>
                        <FaEdit />
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleDeleteMeal(category)} className="delete-button" disabled={meals[category].length === 0}>
                        <FaTrash />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuList;