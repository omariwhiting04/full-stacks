// server.js
console.log('🚀  Starting server.js');

const express = require('express');
const cors    = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');
const http    = require('http');

const app  = express();
const PORT = 4001;

// Keep‑alive hack (you can leave this)
setInterval(() => {}, 1_000_000);

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// DB setup
const db = new sqlite3.Database(
  path.resolve(__dirname, 'favorites.db'),
  err => { if (err) console.error('DB open error:', err); }
);
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
app.get('/ping', (req, res) => res.send('pong'));

// ────── CRUD Routes ──────

// 1) Read all favorites
app.get('/api/favorites', (req, res) => {
  db.all('SELECT * FROM favorites', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2) Create a new favorite
app.post('/api/favorites', (req, res) => {
  const { ticker, industry } = req.body;
  if (!ticker) {
    return res.status(400).json({ error: 'ticker is required' });
  }
  db.run(
    'INSERT OR IGNORE INTO favorites (ticker, industry) VALUES (?, ?)',
    [ticker.toUpperCase(), industry],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(
        'SELECT * FROM favorites WHERE id = ?',
        [this.lastID],
        (err2, row) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.status(201).json(row);
        }
      );
    }
  );
});

// 3) Delete a favorite by id
app.delete('/api/favorites/:id', (req, res) => {
  db.run(
    'DELETE FROM favorites WHERE id = ?',
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Favorite not found' });
      }
      res.status(204).end();
    }
  );
});

// ===== Manually create & bind the HTTP server =====
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`▶  HTTP Server listening on port ${PORT}`);
});
server.on('connection', sock => {
  console.log('🔌  New connection from', sock.remoteAddress);
});
