import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Fitness = () => {
  const [day, setDay] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [activities, setActivities] = useState([]);
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [type, setType] = useState('Cardio'); // Default to Cardio
  const [error, setError] = useState('');

  // Fetch activities data for the selected day
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
      setActivities(response.data.activities || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch fitness data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [day]);

  const handleDayChange = (e) => {
    setDay(e.target.value);
  };

  // Handle form submission to add an activity
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!description.trim()) {
      setError('Description cannot be empty.');
      return;
    }
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0 || durationNum > 300) {
      setError('Duration must be a positive number and less than 300 minutes.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to add an activity.');
        return;
      }

      await axios.post(
        'http://localhost:3000/api/activities',
        { description, duration: durationNum, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDescription(''); // Clear the form
      setDuration('');
      setType('Cardio');
      fetchData(); // Refresh the data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add activity');
    }
  };

  return (
    <div className="main-content">
      <h2>Fitness</h2>
      <div>
        <label>Select Day: </label>
        <input type="date" value={day} onChange={handleDayChange} />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="activity-section">
        <h3>Activities</h3>
        <ul className="activity-list">
          {activities.map((activity, index) => (
            <li key={index}>
              <div className="item-content">
                <span>{activity.description} - {activity.duration} mins ({activity.type})</span>
              </div>
              <span className="timestamp">{new Date(activity.timestamp).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="add-meal-form">
        <h3>Add Activity</h3>
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
          <label>Duration (mins):</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="Cardio">Cardio</option>
            <option value="Strength">Strength</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <button type="submit">Add Activity</button>
      </form>
    </div>
  );
};

export default Fitness;