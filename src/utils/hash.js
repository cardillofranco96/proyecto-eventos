import bcrypt from 'bcryptjs';

export function createHash(password) {
  return bcrypt.hashSync(password, 10);
}

export function isValidPassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}