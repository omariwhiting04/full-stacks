import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ALPHA_KEY = 'YOUR_ALPHAVANTAGE_KEY';

export default function FavoritesList() {
  const [favs, setFavs]         = useState([]);
  const [filter, setFilter]     = useState('');
  const [metrics, setMetrics]   = useState({});
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [newTicker, setNewTicker]   = useState('');
  const [newIndustry, setNewIndustry] = useState('');

  // Load favorites
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/favorites');
        setFavs(data);
        fetchAllMetrics(data);
      } catch {
        setError('Failed to load favorites');
      }
      setLoading(false);
    })();
  }, []);

  // Add
  const handleAdd = async e => {
    e.preventDefault();
    if (!newTicker || !newIndustry) return;
    setLoading(true);
    try {
      const { data: created } = await axios.post('/api/favorites', {
        ticker: newTicker.toUpperCase(),
        industry: newIndustry
      });
      setFavs(f => [...f, created]);
      fetchAllMetrics([created]);
      setNewTicker('');
      setNewIndustry('');
      setError('');
    } catch {
      setError('Could not add');
    }
    setLoading(false);
  };

  // Remove
  const handleRemove = async id => {
    try {
      await axios.delete(`/api/favorites/${id}`);
      setFavs(f => f.filter(x => x.id !== id));
      setError('');
    } catch {
      setError('Could not remove');
    }
  };

  // Fetch metrics (same as before)…
  const fetchAllMetrics = async favorites => {
    const m = {};
    await Promise.all(favorites.map(async fav => {
      /* your AlphaVantage code here */
    }));
    setMetrics(prev => ({ ...prev, ...m }));
  };

  const filtered   = favs.filter(f => !filter || f.industry === filter);
  const industries = [...new Set(favs.map(f => f.industry))];

  return (
    <div>
      <h3>Your Favorites</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading…</p>}

      <form onSubmit={handleAdd}>
        <input
          placeholder="Ticker"
          value={newTicker}
          onChange={e => setNewTicker(e.target.value)}
        />
        <input
          placeholder="Industry"
          value={newIndustry}
          onChange={e => setNewIndustry(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <label>
        Filter:
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">All</option>
          {industries.map(i => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </label>

      <table>
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
                <td>{m.growth ?? '…'}</td>
                <td>{m.pe     ?? '…'}</td>
                <td>{m.growthOverPE ?? '…'}</td>
                <td>{m.low    ?? '…'}</td>
                <td>{m.high   ?? '…'}</td>
                <td>{m.price  ?? '…'}</td>
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
