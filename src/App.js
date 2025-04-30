import React, { useState } from 'react';
import StockDetail   from './components/StockDetail';
import FavoritesList from './components/FavoritesList';

function App() {
  const [ticker, setTicker]     = useState('');
  const [industry, setIndustry] = useState('');

  const handleSearch = () => {
    // TODO: replace this stub with real lookup
    // For now, we'll just set the industry manually.
    setIndustry('tech');
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

      {ticker && industry && (
        <StockDetail ticker={ticker} industry={industry} />
      )}

      <hr style={{ margin: '40px 0' }} />

      <FavoritesList />
    </div>
  );
}

export default App;
