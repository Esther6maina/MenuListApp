const axios = require('axios');
require('dotenv').config();

exports.searchRecipes = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
    if (!SPOONACULAR_API_KEY) {
      return res.status(500).json({ error: 'Spoonacular API key is not configured' });
    }

    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        query,
        apiKey: SPOONACULAR_API_KEY,
        number: 10,
        addRecipeNutrition: true,
      },
    });

    res.json(response.data.results);
  } catch (error) {
    console.error('Spoonacular API error in /api/spoonacular/search:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch recipes from Spoonacular' });
  }
};

exports.analyzeMeal = async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients list is required and must be a non-empty array' });
    }

    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
    if (!SPOONACULAR_API_KEY) {
      return res.status(500).json({ error: 'Spoonacular API key is not configured' });
    }

    const ingredientList = ingredients.join('\n');
    const response = await axios.post(
      'https://api.spoonacular.com/recipes/analyze',
      {
        title: 'Custom Meal',
        ingredients: ingredientList,
        servings: 1,
      },
      {
        params: { apiKey: SPOONACULAR_API_KEY },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Spoonacular API error in /api/spoonacular/analyze:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to analyze meal' });
  }
};