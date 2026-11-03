import assert from 'node:assert/strict';
import test from 'node:test';
import app from '../src/app.js';
import { isValidPassword } from '../src/utils/hash.js';
import {
  registerUser,
  RegistrationError
} from '../src/services/sessions.service.js';

const validRegistration = {
  first_name: ' Ana ',
  last_name: ' Pérez ',
  email: ' ANA@example.com ',
  password: 'clave-segura-123',
  role: 'admin'
};

test('registra un usuario normalizado con hash y rol público seguro', async () => {
  let createdUser;
  const repository = {
    async getByEmail() {
      return null;
    },
    async save(userData) {
      createdUser = userData;
      return { _id: 'user-id', ...userData };
    }
  };

  const user = await registerUser(validRegistration, repository);

  assert.equal(createdUser.first_name, 'Ana');
  assert.equal(createdUser.last_name, 'Pérez');
  assert.equal(createdUser.email, 'ana@example.com');
  assert.equal(createdUser.role, 'user');
  assert.notEqual(createdUser.password, validRegistration.password);
  assert.equal(await isValidPassword(validRegistration.password, createdUser.password), true);
  assert.deepEqual(user, {
    id: 'user-id',
    first_name: 'Ana',
    last_name: 'Pérez',
    email: 'ana@example.com',
    role: 'user'
  });
  assert.equal('password' in user, false);
});

test('rechaza campos obligatorios faltantes y datos inválidos', async () => {
  const repository = {
    async getByEmail() {
      throw new Error('No debe consultar el repositorio');
    }
  };

  await assert.rejects(
    registerUser({ ...validRegistration, first_name: ' ' }, repository),
    (error) => error instanceof RegistrationError && error.statusCode === 400
  );
  await assert.rejects(
    registerUser({ ...validRegistration, email: 'no-es-email' }, repository),
    (error) => error instanceof RegistrationError && error.statusCode === 400
  );
  await assert.rejects(
    registerUser({ ...validRegistration, password: 'corta' }, repository),
    (error) => error instanceof RegistrationError && error.statusCode === 400
  );
});

test('rechaza un email ya registrado', async () => {
  const repository = {
    async getByEmail() {
      return { _id: 'existing-user' };
    }
  };

  await assert.rejects(
    registerUser(validRegistration, repository),
    (error) => error instanceof RegistrationError &&
      error.statusCode === 409 &&
      error.message === 'El email ya está registrado'
  );
});

test('convierte duplicados detectados por el índice único en conflicto', async () => {
  const repository = {
    async getByEmail() {
      return null;
    },
    async save() {
      throw Object.assign(new Error('duplicate key'), { code: 11000 });
    }
  };

  await assert.rejects(
    registerUser(validRegistration, repository),
    (error) => error instanceof RegistrationError &&
      error.statusCode === 409 &&
      error.message === 'El email ya está registrado'
  );
});

test('la ruta de registro devuelve 400 en JSON para campos faltantes', async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api/sessions/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ana@example.com' })
      }
    );
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.status, 'error');
    assert.equal(body.message, 'Faltan campos obligatorios');
    assert.equal('password' in body, false);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test('la ruta de registro devuelve 400 JSON si el body no es JSON válido', async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api/sessions/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{invalid'
      }
    );
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.status, 'error');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});