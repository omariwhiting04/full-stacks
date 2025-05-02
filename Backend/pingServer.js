// pingServer.js
const express = require('express');
const app = express();

// Simple health check endpoint
app.get('/ping', (req, res) => {
  console.log('Received /ping');
  res.send('pong');
});


const PORT = 4000;
// bind on all IPv4 addresses
app.listen(PORT, '0.0.0.0', () => {
  console.log(`▶ Ping server listening on http://0.0.0.0:${PORT}`);
});
