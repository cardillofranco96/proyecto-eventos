import User from '../models/User.js';

export function getByEmail(email) {
  return User.findOne({ email });
}

export function getByEmailForAuth(email) {
  return User.findOne({ email }).select('+password');
}

export function save(userData) {
  return User.create(userData);
}