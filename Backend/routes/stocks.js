const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.FINNHUB_API_KEY;

router.get('/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();

  try {
    const response = await axios.get('https://finnhub.io/api/v1/stock/profile2', {
      params: {
        symbol: ticker,
        token: API_KEY
      }
    });

    const data = response.data;

    if (!data || !data.name) {
      return res.status(404).json({ error: 'Ticker not found or invalid' });
    }

    res.json({
      ticker: data.ticker || ticker,
      name: data.name,
      industry: data.finnhubIndustry || 'Unknown'
    });

  } catch (err) {
    console.error('Finnhub API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

module.exports = router;
