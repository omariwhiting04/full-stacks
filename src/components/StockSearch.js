import React, { useState } from 'react';

function StockSearch({ onResult }) {
  const [ticker, setTicker] = useState('');
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!ticker.trim()) {
      setError('Please enter a ticker symbol.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/stocks/${ticker.toUpperCase()}`);
      if (!response.ok) throw new Error('Ticker not found');

      const data = await response.json();
      setError(null);
      onResult({ ticker: ticker.toUpperCase(), industry: data.industry || 'tech' });
    } catch (err) {
      setError(err.message);
      onResult(null);
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <input
        placeholder="Ticker symbol, e.g. AAPL"
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
      />
      <button onClick={handleSearch} style={{ marginLeft: 8 }}>
        Lookup
      </button>
      {error && (
        <div style={{ color: 'red', marginTop: 8 }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export default StockSearch;
