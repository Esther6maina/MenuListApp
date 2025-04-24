// src/pages/RecipeSearchSection.js
import React, { useState } from 'react';
import axios from 'axios';

const RecipeSearchSection = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecipes([]);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to search for recipes.');
        setLoading(false);
        return;
      }
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/spoonacular/search`, {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes(response.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="recipe-search-section">
      <h2>Search for Recipes</h2>
      <form onSubmit={handleSearch} className="recipe-search-form">
        <input
          type="text"
          placeholder="Search for recipes (e.g., chicken salad)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {loading && <div className="loading-spinner">Loading...</div>}
      <div className="recipe-results">
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <h3>{recipe.title}</h3>
              {recipe.nutrition?.nutrients?.find(n => n.name === 'Calories') ? (
                <p>
                  Calories: {recipe.nutrition.nutrients.find(n => n.name === 'Calories').amount}{' '}
                  {recipe.nutrition.nutrients.find(n => n.name === 'Calories').unit}
                </p>
              ) : (
                <p>Calories: Not available</p>
              )}
            </div>
          ))
        ) : (
          !loading && <p className="no-results">No recipes found. Try a different search term!</p>
        )}
      </div>
    </section>
  );
});

export default RecipeSearchSection;