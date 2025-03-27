import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Fasting = () => {
  const [day, setDay] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [fasting, setFasting] = useState([]);
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');

  // Fetch fasting data for the selected day
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
      setFasting(response.data.fasting || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch fasting data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [day]);

  const handleDayChange = (e) => {
    setDay(e.target.value);
  };

  // Handle form submission to add a fasting period
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0 || durationNum > 48) {
      setError('Fasting duration must be a positive number and less than 48 hours.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to add a fasting period.');
        return;
      }

      await axios.post(
        'http://localhost:3000/api/fasting',
        { duration: durationNum },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDuration(''); // Clear the form
      fetchData(); // Refresh the data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add fasting period');
    }
  };

  return (
    <div className="main-content">
      <h2>Fasting</h2>
      <div>
        <label>Select Day: </label>
        <input type="date" value={day} onChange={handleDayChange} />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="fasting-section">
        <h3>Fasting Logs</h3>
        <ul className="fasting-list">
          {fasting.map((fast, index) => (
            <li key={index}>
              <div className="item-content">
                <span>{fast.duration} hours</span>
              </div>
              <span className="timestamp">{new Date(fast.timestamp).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="add-meal-form">
        <h3>Add Fasting Period</h3>
        <div>
          <label>Duration (hours):</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Fasting</button>
      </form>
    </div>
  );
};

export default Fasting;