// src/pages/MenuList.js
import React, { useState, useEffect } from 'react';
import './MenuList.css';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const MenuList = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  });
  const [newItem, setNewItem] = useState({ breakfast: '', lunch: '', dinner: '', snacks: '' });
  const [editItem, setEditItem] = useState({ id: null, content: '', category: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch data for the selected date
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your menu list.');
          setLoading(false);
          return;
        }
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/food`, {
          params: { date: selectedDate },
          headers: { Authorization: `Bearer ${token}` },
        });
        // Assuming the API returns data in the format: { breakfast: [], lunch: [], dinner: [], snacks: [] }
        setMeals(response.data || { breakfast: [], lunch: [], dinner: [], snacks: [] });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch menu data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  // Add a new item to a category
  const handleAddItem = async (category) => {
    const content = newItem[category].trim();
    if (!content) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/food`,
        { date: selectedDate, category, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeals((prev) => ({
        ...prev,
        [category]: [...prev[category], response.data],
      }));
      setNewItem((prev) => ({ ...prev, [category]: '' }));
    } catch (err) {
      setError('Failed to add item');
    }
  };

  // Delete an item from a category
  const handleDeleteItem = async (category, id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/food/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeals((prev) => ({
        ...prev,
        [category]: prev[category].filter((item) => item.id !== id),
      }));
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  // Start editing an item
  const handleEditStart = (category, item) => {
    setEditItem({ id: item.id, content: item.content, category });
  };

  // Save edited item
  const handleEditSave = async () => {
    const { id, content, category } = editItem;
    if (!content.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/food/${id}`,
        { content, date: selectedDate, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeals((prev) => ({
        ...prev,
        [category]: prev[category].map((item) =>
          item.id === id ? { ...item, content } : item
        ),
      }));
      setEditItem({ id: null, content: '', category: '' });
    } catch (err) {
      setError('Failed to update item');
    }
  };

  // Render a section for each meal category
  const renderSection = (category, title) => (
    <div className={`${category}-section meal-section`}>
      <h3>{title}</h3>
      <div className="add-item-form">
        <input
          type="text"
          placeholder={`Add a ${title} item...`}
          value={newItem[category]}
          onChange={(e) => setNewItem((prev) => ({ ...prev, [category]: e.target.value }))}
          disabled={loading}
        />
        <button onClick={() => handleAddItem(category)} disabled={loading}>
          <FaPlus /> Add
        </button>
      </div>
      <ul className="meal-list">
        {meals[category].length > 0 ? (
          meals[category].map((item) => (
            <li key={item.id} className="list-item">
              {editItem.id === item.id ? (
                <div className="edit-item-form">
                  <input
                    type="text"
                    value={editItem.content}
                    onChange={(e) => setEditItem((prev) => ({ ...prev, content: e.target.value }))}
                  />
                  <button onClick={handleEditSave}>Save</button>
                  <button onClick={() => setEditItem({ id: null, content: '', category: '' })}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span className="item-content">{item.content}</span>
                  <div className="item-actions">
                    <button onClick={() => handleEditStart(category, item)}>
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDeleteItem(category, item.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))
        ) : (
          <li className="no-data">No {title} items for this date.</li>
        )}
      </ul>
    </div>
  );

  return (
    <div className="main-content">
      <h1 className="page-title">Menu List</h1>
      <div className="date-picker">
        <label htmlFor="date-select">Select Date:</label>
        <input
          id="date-select"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          disabled={loading}
        />
      </div>
      {error && <p className="error-message">{error}</p>}
      {loading && <div className="loading-spinner">Loading...</div>}
      <div className="grid-container">
        {renderSection('breakfast', 'Breakfast')}
        {renderSection('lunch', 'Lunch')}
        {renderSection('dinner', 'Dinner')}
        {renderSection('snacks', 'Snacks')}
      </div>
    </div>
  );
};

export default MenuList;