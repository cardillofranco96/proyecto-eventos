import assert from 'node:assert/strict';
import test from 'node:test';
import app from '../src/app.js';
import { LoginError, loginUser } from '../src/services/sessions.service.js';
import { createHash } from '../src/utils/hash.js';
import { generateToken, verifyToken } from '../src/utils/jwt.js';

test('login normaliza el email y devuelve un JWT sin datos de contraseña', async () => {
  const password = 'clave-segura-123';
  const user = {
    _id: 'user-id',
    email: 'ana@example.com',
    password: await createHash(password),
    role: 'organizer'
  };
  const repository = {
    async getByEmailForAuth(email) {
      assert.equal(email, 'ana@example.com');
      return user;
    }
  };

  const result = await loginUser({ email: ' ANA@example.com ', password }, repository);
  const payload = verifyToken(result.token);

  assert.deepEqual(
    { id: payload.id, email: payload.email, role: payload.role },
    { id: 'user-id', email: 'ana@example.com', role: 'organizer' }
  );
  assert.equal('password' in payload, false);
});

test('login devuelve 400 si faltan credenciales sin consultar el DAO', async () => {
  const repository = {
    async getByEmailForAuth() {
      assert.fail('No debe consultar el repositorio');
    }
  };

  await assert.rejects(
    loginUser({ email: 'ana@example.com' }, repository),
    (error) => error instanceof LoginError && error.statusCode === 400
  );
});

test('email inexistente y password incorrecta comparten el mismo error', async () => {
  const hashedPassword = await createHash('clave-correcta');
  const repositoryFor = (user) => ({
    async getByEmailForAuth() {
      return user;
    }
  });
  const attempts = [
    loginUser(
      { email: 'nadie@example.com', password: 'clave-incorrecta' },
      repositoryFor(null)
    ),
    loginUser(
      { email: 'ana@example.com', password: 'clave-incorrecta' },
      repositoryFor({ email: 'ana@example.com', password: hashedPassword })
    )
  ];

  for (const attempt of attempts) {
    await assert.rejects(attempt, (error) => {
      assert.equal(error.statusCode, 401);
      assert.equal(error.message, 'Credenciales inválidas');
      return error instanceof LoginError;
    });
  }
});

test('current requiere JWT válido y nunca devuelve una contraseña', async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const unauthenticated = await fetch(`${baseUrl}/api/sessions/current`);
    assert.equal(unauthenticated.status, 401);
    assert.deepEqual(await unauthenticated.json(), {
      status: 'error',
      message: 'No autenticado'
    });

    const invalid = await fetch(`${baseUrl}/api/sessions/current`, {
      headers: { Cookie: 'currentUser=invalid-token' }
    });
    assert.equal(invalid.status, 401);

    const token = generateToken({
      id: 'user-id',
      email: 'ana@example.com',
      role: 'user'
    });
    const authenticated = await fetch(`${baseUrl}/api/sessions/current`, {
      headers: { Cookie: `currentUser=${token}` }
    });
    const body = await authenticated.json();

    assert.equal(authenticated.status, 200);
    assert.deepEqual(body.payload, verifyToken(token));
    assert.equal('password' in body.payload, false);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test('logout responde correctamente y expira la cookie de sesión', async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api/sessions/logout`,
      { method: 'POST' }
    );

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      status: 'success',
      message: 'Sesión cerrada'
    });
    assert.match(response.headers.get('set-cookie'), /currentUser=;/);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});