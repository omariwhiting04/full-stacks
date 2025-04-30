// server.js
const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const sqlite3    = require('sqlite3').verbose();
const path       = require('path');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

// Log every incoming request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Open or create the SQLite database
const db = new sqlite3.Database(path.resolve(__dirname, 'favorites.db'), err => {
  if (err) console.error('DB open error:', err);
});

// Ensure table exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker      TEXT    NOT NULL,
      industry    TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// **Debug route** – test this first
app.get('/ping', (req, res) => {
  res.send('pong');
});

// GET favorites
app.get('/api/favorites', (req, res) => {
  db.all('SELECT * FROM favorites', [], (err, rows) => {
    if (err) {
      console.error('DB error on GET /api/favorites:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST a new favorite
app.post('/api/favorites', (req, res) => {
  const { ticker, industry } = req.body;
  db.run(
    'INSERT INTO favorites (ticker, industry) VALUES (?, ?)',
    [ticker, industry],
    function (err) {
      if (err) {
        console.error('DB error on POST /api/favorites:', err);
        return res.status(500).json({ error: err.message });
      }
      db.get('SELECT * FROM favorites WHERE id = ?', [this.lastID], (err2, row) => {
        if (err2) {
          console.error('DB error fetching inserted row:', err2);
          return res.status(500).json({ error: err2.message });
        }
        res.json(row);
      });
    }
  );
});

// at the bottom of pingServer.js (or server.js)
const PORT = 4000;
// bind to all addresses, IPv4 + IPv6
app.listen(PORT, '::', () => {
  console.log(`▶ Server listening on http://localhost:${PORT} (IPv4+IPv6)`);
});
