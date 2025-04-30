import React from 'react';
import axios from 'axios';

export default function StockDetail({ ticker, industry }) {
  const handleFavorite = async () => {
    try {
      const res = await axios.post(
        'http://localhost:4000/api/favorites',
        { ticker, industry }
      );
      alert(`${res.data.ticker} was added to favorites!`);
    } catch (err) {
      console.error(err);
      alert('❌ Could not add favorite');
    }
  };

  return (
    <div className="stock-detail">
      <h2>{ticker}</h2>
      <p>Industry: {industry}</p>
      <button onClick={handleFavorite}>
        ❤️ Favorite
      </button>
    </div>
  );
}
