import React, { useState } from 'react';
import StockDetail from './components/StockDetail';
import FavoritesList from './components/FavoritesList';

function App() {
  const [ticker, setTicker]     = useState('');
  const [industry, setIndustry] = useState('');
  const [error, setError]       = useState(null); // 🔧 new

  const handleSearch = async () => {
    if (!ticker.trim()) {
      setError('Please enter a ticker symbol.');
      return;
    }

    try {
      // ✅ Call your backend API to get stock info
      const response = await fetch(`http://localhost:4000/stocks/${ticker.toUpperCase()}`);
      if (!response.ok) throw new Error('Ticker not found');

      const data = await response.json();

      // Assume the backend returns { industry: 'tech' }
      setIndustry(data.industry || 'tech');
      setError(null); // Clear any existing errors
    } catch (err) {
      setError(err.message || 'Failed to fetch stock data.');
      setIndustry('');
    }
  };

  return (
    <div className="App" style={{ padding: 20 }}>
      <h1>Stock Dashboard</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Ticker symbol, e.g. AAPL"
          value={ticker}
          onChange={e => setTicker(e.target.value.toUpperCase())}
        />
        <button onClick={handleSearch} style={{ marginLeft: 8 }}>
          Lookup
        </button>
      </div>

      {/* 🔴 Show error if one exists */}
      {error && (
        <div style={{ color: 'red', marginBottom: 10 }}>
          {error}
        </div>
      )}

      {/* ✅ Keep existing condition unchanged */}
      {ticker && industry && (
        <StockDetail ticker={ticker} industry={industry} />
      )}

      <hr style={{ margin: '40px 0' }} />
      <FavoritesList />
    </div>
  );
}

export default App;

