import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Fitness = () => {
  const [day, setDay] = useState(new Date().toISOString().split('T')[0]);
  const [activities, setActivities] = useState([]);
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
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
      setActivities(response.data.activities || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch activities');
    }
  }, [day]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !duration) {
      setError('Please enter activity type and duration.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to add an activity.');
        return;
      }

      await axios.post(
        'http://localhost:3000/api/data',
        { activities: [{ type, duration: Number(duration), timestamp: new Date().toISOString() }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setType('');
      setDuration('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add activity');
    }
  };

  return (
    <div className="main-content">
      <h2>Fitness</h2>
      <div>
        <label>Select Day: </label>
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="activity-section">
        <h3>Activities</h3>
        <ul className="activity-list">
          {activities.map((activity, index) => (
            <li key={index}>
              <div className="item-content">
                <span>{activity.type}: {activity.duration} minutes</span>
              </div>
              <span className="timestamp">{new Date(activity.timestamp).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="add-activity-form">
        <h3>Add Activity</h3>
        <div>
          <label>Type:</label>
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="e.g., Running"
            required
          />
        </div>
        <div>
          <label>Duration (minutes):</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 30"
            required
          />
        </div>
        <button type="submit">Add Activity</button>
      </form>
    </div>
  );
};

export default Fitness;