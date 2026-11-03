import User from '../models/User.js';

export function getByEmail(email) {
  return User.findOne({ email });
}

export function save(userData) {
  return User.create(userData);
}