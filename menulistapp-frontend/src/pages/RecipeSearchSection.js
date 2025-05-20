import React, { useState } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';

const RecipeSearchSection = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a search term.');
      return;
    }
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
      const response = await axios.get('/api/spoonacular/search', {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedRecipes = response.data.results || [];
      setRecipes(fetchedRecipes);
      if (fetchedRecipes.length === 0) {
        setError('No recipes found. Try a different search term!');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      setError(err.response?.data?.error || 'Failed to fetch recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="recipe-search-section">
      <h2>Search for Recipes</h2>
      <p className="recipe-search-description">
        Find healthy recipes to match your dietary needs.
      </p>
      <form onSubmit={handleSearch} className="recipe-search-form">
        <FaSearch />
        <input
          type="text"
          placeholder="Search for recipes (e.g., chicken salad)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading}
          aria-label="Search for recipes"
        />
        <button type="submit" disabled={loading} aria-label="Search recipes">
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
              <p>Calories: Not available (mock data)</p>
              {/* Uncomment when using real Spoonacular API
              {recipe.nutrition?.nutrients?.find(n => n.name === 'Calories') ? (
                <p>
                  Calories: {recipe.nutrition.nutrients.find(n => n.name === 'Calories').amount}{' '}
                  {recipe.nutrition.nutrients.find(n => n.name === 'Calories').unit}
                </p>
              ) : (
                <p>Calories: Not available</p>
              )}
              */}
            </div>
          ))
        ) : (
          !loading && !error && <p className="no-results">Search for a recipe to get started!</p>
        )}
      </div>
    </section>
  );
});

export default RecipeSearchSection;