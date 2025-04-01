import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Fasting = () => {
  const [day, setDay] = useState(new Date().toISOString().split('T')[0]);
  const [fasting, setFasting] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
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
      setFasting(response.data.fasting || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch fasting data');
    }
  }, [day]); // `day` is a dependency of `fetchData`

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Add `fetchData` to the dependency array

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!start || !end) {
      setError('Please enter start and end times.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to add fasting data.');
        return;
      }

      await axios.post(
        'http://localhost:3000/api/data',
        { fasting: [{ start, end, timestamp: new Date().toISOString() }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStart('');
      setEnd('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add fasting data');
    }
  };

  return (
    <div className="main-content">
      <h2>Fasting</h2>
      <div>
        <label>Select Day: </label>
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="fasting-section">
        <h3>Fasting Periods</h3>
        <ul className="fasting-list">
          {fasting.map((period, index) => (
            <li key={index}>
              <div className="item-content">
                <span>Start: {new Date(period.start).toLocaleTimeString()}</span>
                <span>End: {new Date(period.end).toLocaleTimeString()}</span>
              </div>
              <span className="timestamp">{new Date(period.timestamp).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="add-fasting-form">
        <h3>Add Fasting Period</h3>
        <div>
          <label>Start Time:</label>
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </div>
        <div>
          <label>End Time:</label>
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Fasting Period</button>
      </form>
    </div>
  );
};

export default Fasting;