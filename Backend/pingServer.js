// server.js
console.log('🚀  Starting server.js');

const express = require('express');
const cors    = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const app  = express();
const PORT = 4000;

// Keep Node’s event loop alive (Express 5 on macOS workaround)
setInterval(() => {}, 1_000_000);

// Built‑in body parser + CORS
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// SQLite setup
const db = new sqlite3.Database(path.resolve(__dirname, 'favorites.db'), err => {
  if (err) console.error('DB open error:', err);
});
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker      TEXT    NOT NULL UNIQUE,
      industry    TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Health check
app.get('/ping', (req, res) => {
  console.log('📬  GET /ping');
  res.send('pong');
});

// CRUD endpoints
app.get('/api/favorites', (req, res) => {
  db.all('SELECT * FROM favorites', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/favorites', (req, res) => {
  const { ticker, industry } = req.body;
  db.run(
    'INSERT OR IGNORE INTO favorites (ticker, industry) VALUES (?, ?)',
    [ticker, industry],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM favorites WHERE id = ?', [this.lastID], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(row);
      });
    }
  );
});

app.delete('/api/favorites/:id', (req, res) => {
  db.run(
    'DELETE FROM favorites WHERE id = ?',
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
      res.status(204).end();
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`▶  Server listening on port ${PORT}`);
});
