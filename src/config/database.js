import mongoose from 'mongoose';
import config from './config.js';

export async function connectDatabase() {
  if (!config.MONGO_URL) {
    throw new Error('La variable MONGO_URL es obligatoria');
  }

  await mongoose.connect(config.MONGO_URL);
  console.log('Conexión a MongoDB establecida');
}