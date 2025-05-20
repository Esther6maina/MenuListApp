const axios = require('axios');
require('dotenv').config();

exports.searchFoods = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
    if (!SPOONACULAR_API_KEY) {
      return res.status(500).json({ error: 'Spoonacular API key is not configured' });
    }

    const response = await axios.get('https://api.spoonacular.com/food/ingredients/search', {
      params: {
        query,
        apiKey: SPOONACULAR_API_KEY,
        number: 10,
      },
    });

    res.json(response.data.results);
  } catch (error) {
    console.error('Error in /api/foods/search:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to search foods' });
  }
};