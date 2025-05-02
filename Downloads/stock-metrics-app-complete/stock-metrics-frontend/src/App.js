import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [ticker, setTicker] = useState('');
  const [stockData, setStockData] = useState(null);

  const handleSearch = async () => {
    try {
      const res = await axios.get(`/api/stocks/${ticker}`);
      console.log("📊 API Response:", res.data);
      if (res.data.error) {
        alert(`❌ ${res.data.error}`);
        setStockData(null);
      } else {
        setStockData(res.data);
      }
    } catch (err) {
      console.error('❌ API error:', err);
      alert('Failed to fetch stock data.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Stock Metrics</h1>
      <input
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
        placeholder="Enter ticker (e.g. AAPL)"
      />
      <button onClick={handleSearch}>Lookup</button>

      {stockData && (
        <div style={{ marginTop: 20 }}>
          <h2>{stockData.ticker}</h2>
          <p>Industry: {stockData.industry}</p>
          <p>P/E Ratio: {stockData.peRatio}</p>
          <p>Growth Rate: {stockData.growthRate ?? 'N/A'}</p>
          <p>Growth over P/E: {stockData.growthOverPE ?? 'N/A'}</p>
          <p>52 Week High: {stockData.high52}</p>
          <p>52 Week Low: {stockData.low52}</p>
          <p>Current Price: {stockData.currentPrice}</p>
        </div>
      )}
    </div>
  );
}

export default App;
