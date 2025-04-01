import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Hydration = () => {
  const [day, setDay] = useState(new Date().toISOString().split('T')[0]);
  const [water, setWater] = useState([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
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
      setError(err.response?.data?.error || 'Failed to fetch water data');
    }
  }, [day]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) {
      setError('Please enter an amount.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to add water intake.');
        return;
      }

      await axios.post(
        'http://localhost:3000/api/data',
        { water: [{ amount: Number(amount), timestamp: new Date().toISOString() }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAmount('');
      fetchData(); // This should now work correctly
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add water intake');
    }
  };

  return (
    <div className="main-content">
      <h2>Hydration</h2>
      <div>
        <label>Select Day: </label>
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
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

      <form onSubmit={handleSubmit} className="add-water-form">
        <h3>Add Water Intake</h3>
        <div>
          <label>Amount (ml):</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 500"
            required
          />
        </div>
        <button type="submit">Add Water</button>
      </form>
    </div>
  );
};

export default Hydration;