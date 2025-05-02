// src/components/StockDetail.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StockDetail({ ticker, industry }) {
  const [quote,   setQuote]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    // TODO: your existing fetch logic for quote, income statement, etc.
    // e.g. setLoading(true), axios.get(...), setQuote(...), setLoading(false)
  }, [ticker]);

  const handleFavorite = async () => {
    try {
      await axios.post('/api/favorites', { ticker, industry });
      setError('');
      alert(`✅ ${ticker} added to favorites!`);
      window.location.reload();    // force a full reload so FavoritesList picks it up
    } catch (err) {
      console.error('Favorite error:', err);
      setError('Cannot favorite — check console or network tab for details');
    }
  };

  return (
    <div>
      {/* …your existing StockDetail UI here… */}
      <button onClick={handleFavorite} disabled={loading}>
        {loading ? 'Adding…' : 'Add to Favorites'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
