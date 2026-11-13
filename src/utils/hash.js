import bcrypt from 'bcryptjs';

export function createHash(password) {
  return bcrypt.hash(password, 10);
}

export function isValidPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}