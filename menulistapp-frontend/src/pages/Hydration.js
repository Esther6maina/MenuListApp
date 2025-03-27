import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Hydration = () => {
  const [day, setDay] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [water, setWater] = useState([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  // Fetch water intake data for the selected day
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your data.');
          return;
        }

        const response = await axios.get(`http://localhost:3000/api/data/${day}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWater(response.data.water || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch hydration data');
      }
    };

    fetchData();
  }, [day]); // Dependency array only includes 'day'

  const handleDayChange = (e) => {
    setDay(e.target.value);
  };

  // Handle form submission to add water intake
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > 5000) {
      setError('Water amount must be a positive number and less than 5000 ml.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to add water intake.');
        return;
      }

      await axios.post(
        'http://localhost:3000/api/water',
        { amount: amountNum },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAmount(''); // Clear the form
      fetchData(); // Refresh the data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add water intake');
    }
  };

  return (
    <div className="main-content">
      <h2>Hydration</h2>
      <div>
        <label>Select Day: </label>
        <input type="date" value={day} onChange={handleDayChange} />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="hydration-section">
        <h3>Water Intake</h3>
        <ul className="water-list">
          {water.map((entry, index) => (
            <li key={index}>
              <div className="item-content">
                <span>{entry.amount} ml</span>
              </div>
              <span className="timestamp">{new Date(entry.timestamp).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="add-meal-form">
        <h3>Add Water Intake</h3>
        <div>
          <label>Amount (ml):</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Water</button>
      </form>
    </div>
  );
};

export default Hydration;