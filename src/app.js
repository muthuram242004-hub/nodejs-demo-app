const express = require('express');

const app = express();
app.use(express.json());

const APP_VERSION = process.env.APP_VERSION || 'dev';

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from nodejs-demo-app, deployed with GitHub Actions + Docker!',
    version: APP_VERSION,
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.get('/add', (req, res) => {
  const a = Number(req.query.a);
  const b = Number(req.query.b);
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return res.status(400).json({ error: 'Query params a and b must be numbers' });
  }
  return res.json({ result: a + b });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
