import usersRepository from '../repositories/users.repository.js';
import { createHash } from '../utils/hash.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class RegistrationError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'RegistrationError';
    this.statusCode = statusCode;
  }
}

function validateRegistration(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new RegistrationError('El body debe ser un objeto JSON', 400);
  }

  const requiredFields = ['first_name', 'last_name', 'email', 'password'];
  const missingFields = requiredFields.filter((field) => {
    return typeof data[field] !== 'string' || !data[field].trim();
  });

  if (missingFields.length) {
    throw new RegistrationError('Faltan campos obligatorios', 400);
  }

  const email = data.email.trim().toLowerCase();
  if (!emailPattern.test(email)) {
    throw new RegistrationError('El email no tiene un formato válido', 400);
  }

  if (data.password.length < 6) {
    throw new RegistrationError(
      'La contraseña debe tener al menos 6 caracteres',
      400
    );
  }

  return {
    first_name: data.first_name.trim(),
    last_name: data.last_name.trim(),
    email,
    password: data.password
  };
}

function toPublicUser(user) {
  const userData = typeof user.toObject === 'function' ? user.toObject() : user;
  return {
    id: String(userData.id ?? userData._id),
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    role: userData.role
  };
}

export async function registerUser(data, repository = usersRepository) {
  const registration = validateRegistration(data);

  if (await repository.getByEmail(registration.email)) {
    throw new RegistrationError('El email ya está registrado', 409);
  }

  const password = await createHash(registration.password);

  try {
    const user = await repository.save({
      ...registration,
      password,
      role: 'user'
    });

    return toPublicUser(user);
  } catch (error) {
    if (error.code === 11000) {
      throw new RegistrationError('El email ya está registrado', 409);
    }
    throw error;
  }
}