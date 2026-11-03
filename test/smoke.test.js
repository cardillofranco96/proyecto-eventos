import assert from 'node:assert/strict';
import test from 'node:test';
import app from '../src/app.js';

test('los endpoints principales responden HTTP 200', async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    for (const endpoint of ['/api/health', '/api/events', '/api/sessions']) {
      const response = await fetch(`${baseUrl}${endpoint}`);
      assert.equal(response.status, 200, `${endpoint} debe responder HTTP 200`);
    }
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});