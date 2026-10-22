const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`nodejs-demo-app listening on port ${PORT}`);
});

// Graceful shutdown so `docker stop` exits cleanly
const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
