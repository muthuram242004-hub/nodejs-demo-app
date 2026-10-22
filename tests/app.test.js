const request = require('supertest');
const app = require('../src/app');

describe('nodejs-demo-app', () => {
  test('GET / returns a welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/nodejs-demo-app/);
  });

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /add sums two numbers', async () => {
    const res = await request(app).get('/add?a=2&b=3');
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(5);
  });

  test('GET /add rejects non-numeric input', async () => {
    const res = await request(app).get('/add?a=x&b=3');
    expect(res.statusCode).toBe(400);
  });

  test('unknown routes return 404', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.statusCode).toBe(404);
  });
});
