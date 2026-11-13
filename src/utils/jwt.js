import jwt from 'jsonwebtoken';
import config from '../config/config.js';

function getSecret() {
  if (!config.JWT_SECRET) {
    throw new Error('La variable JWT_SECRET es obligatoria');
  }

  return config.JWT_SECRET;
}

export function generateToken({ id, email, role }) {
  return jwt.sign(
    { id, email, role },
    getSecret(),
    { expiresIn: config.JWT_EXPIRES_IN || '1h' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}