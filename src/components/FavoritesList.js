import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ALPHA_KEY = 'YOUR_ALPHAVANTAGE_KEY';

export default function FavoritesList() {
  const [favs, setFavs]           = useState([]);
  const [filter, setFilter]       = useState('');
  const [metrics, setMetrics]     = useState({});

  // 1) Load favorites on mount
  useEffect(() => {
    async function loadFavs() {
      try {
        const { data } = await axios.get('/api/favorites');
        setFavs(data);
        fetchAllMetrics(data);
      } catch (err) {
        console.error('Error loading favorites:', err);
      }
    }
    loadFavs();
  }, []);

  // 2) For each favorite, fetch net‑income and quote data
  const fetchAllMetrics = async (favorites) => {
    const m = {};
    await Promise.all(
      favorites.map(async (fav) => {
        const t = fav.ticker;
        // a) Income statement → net income growth
        const inc = await axios.get(
          `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${t}&apikey=${ALPHA_KEY}`
        );
        const reports = inc.data.annualReports;
        const ni0     = parseFloat(reports[0].netIncome);
        const ni1     = parseFloat(reports[1].netIncome);
        const growth  = ((ni0 - ni1) / ni1) * 100;

        // b) Global quote → price, P/E, 52‑wk high/low
        const quoteRes = await axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${t}&apikey=${ALPHA_KEY}`
        );
        const q     = quoteRes.data['Global Quote'];
        const price = parseFloat(q['05. price']);
        const pe    = parseFloat(q['10. priceToEarningsRatio']);
        const high  = parseFloat(q['03. high']);
        const low   = parseFloat(q['04. low']);

        m[t] = {
          growth:        growth.toFixed(2),
          pe:            pe.toFixed(2),
          growthOverPE:  (growth / pe).toFixed(2),
          price:         price.toFixed(2),
          high:          high.toFixed(2),
          low:           low.toFixed(2),
        };
      })
    );
    setMetrics(m);
  };

  // 3) Filter by industry
  const filtered    = favs.filter(f => !filter || f.industry === filter);
  const industries  = [...new Set(favs.map(f => f.industry))];

  return (
    <div>
      <h3>Your Favorites</h3>

      <label>
        Filter by industry:
        <select value={filter}
                onChange={e => setFilter(e.target.value)}>
          <option value="">All</option>
          {industries.map(ind => (
            <option key={ind} value={ind}>{ind}</option>
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
            <th>Growth / P E</th>
            <th>52‑wk Low</th>
            <th>52‑wk High</th>
            <th>Price</th>
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
