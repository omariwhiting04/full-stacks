// src/FavoritesList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ALPHA_KEY = process.env.REACT_APP_ALPHA_VANTAGE_KEY;

export default function FavoritesList() {
  const [favs, setFavs]             = useState([]);
  const [filter, setFilter]         = useState('');
  const [metrics, setMetrics]       = useState({});
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [newTicker, setNewTicker]   = useState('');
  const [newIndustry, setNewIndustry] = useState('');

  // 1) Load favorites on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/favorites');
        setFavs(data);
        await fetchAllMetrics(data);
        setError('');
      } catch {
        setError('Failed to load favorites');
      }
      setLoading(false);
    })();
  }, []);

  // 2) Add a new favorite
  const handleAdd = async e => {
    e.preventDefault();
    if (!newTicker || !newIndustry) return;
    setLoading(true);
    try {
      const { data: created } = await axios.post('/api/favorites', {
        ticker:   newTicker.toUpperCase(),
        industry: newIndustry
      });
      setFavs(f => [...f, created]);
      await fetchAllMetrics([created]);
      setNewTicker('');
      setNewIndustry('');
      setError('');
    } catch {
      setError('Could not add favorite');
    }
    setLoading(false);
  };

  // 3) Remove an existing favorite
  const handleRemove = async id => {
    try {
      await axios.delete(`/api/favorites/${id}`);
      setFavs(f => f.filter(x => x.id !== id));
      setError('');
    } catch {
      setError('Could not remove favorite');
    }
  };

  // 4) Fetch real metrics from AlphaVantage
  const fetchAllMetrics = async (favorites) => {
    const m = {};
    await Promise.all(
      favorites.map(async fav => {
        const t = fav.ticker;
        // Income statement → growth %
        const incRes = await axios.get('https://www.alphavantage.co/query', {
          params: { function: 'INCOME_STATEMENT', symbol: t, apikey: ALPHA_KEY }
        });
        const reports = incRes.data.annualReports || [];
        const ni0     = parseFloat(reports[0]?.netIncome  || 0);
        const ni1     = parseFloat(reports[1]?.netIncome  || 1);
        const growth  = ni1 !== 0 ? ((ni0 - ni1) / ni1) * 100 : 0;

        // Global quote → price, P/E, 52‑wk high/low
        const quoteRes = await axios.get('https://www.alphavantage.co/query', {
          params: { function: 'GLOBAL_QUOTE', symbol: t, apikey: ALPHA_KEY }
        });
        const q     = quoteRes.data['Global Quote'] || {};
        const price = parseFloat(q['05. price']              || 0);
        const pe    = parseFloat(q['10. priceToEarningsRatio'] || 0);
        const high  = parseFloat(q['03. high']               || 0);
        const low   = parseFloat(q['04. low']                || 0);

        m[t] = {
          growth:       growth.toFixed(2),
          pe:           pe.toFixed(2),
          growthOverPE: pe !== 0 ? (growth / pe).toFixed(2) : '–',
          price:        price.toFixed(2),
          high:         high.toFixed(2),
          low:          low.toFixed(2),
        };
      })
    );
    setMetrics(prev => ({ ...prev, ...m }));
  };

  // 5) UI rendering
  const filtered   = favs.filter(f => !filter || f.industry === filter);
  const industries = [...new Set(favs.map(f => f.industry))];

  return (
    <div>
      <h3>Your Favorites</h3>
      {error   && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading…</p>}

      <form onSubmit={handleAdd} style={{ margin: '1em 0' }}>
        <input
          placeholder="Ticker"
          value={newTicker}
          onChange={e => setNewTicker(e.target.value)}
        />
        <input
          placeholder="Industry"
          value={newIndustry}
          onChange={e => setNewIndustry(e.target.value)}
          style={{ marginLeft: 8 }}
        />
        <button type="submit" style={{ marginLeft: 8 }}>Add</button>
      </form>

      <label>
        Filter by industry:
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ marginLeft: 8 }}
        >
          <option value="">All</option>
          {industries.map(i => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </label>

      <table style={{ width: '100%', marginTop: 16 }}>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Industry</th>
            <th>Growth %</th>
            <th>P /E</th>
            <th>Growth/P E</th>
            <th>52‑wk Low</th>
            <th>52‑wk High</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(f => {
            const m = metrics[f.ticker] || {};
            return (
              <tr key={f.id}>
                <td>{f.ticker}</td>
                <td>{f.industry}</td>
                <td>{m.growth        ?? '…'}</td>
                <td>{m.pe            ?? '…'}</td>
                <td>{m.growthOverPE  ?? '…'}</td>
                <td>{m.low           ?? '…'}</td>
                <td>{m.high          ?? '…'}</td>
                <td>{m.price         ?? '…'}</td>
                <td>
                  <button onClick={() => handleRemove(f.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
