import mongoose from 'mongoose';

export async function connectDatabase() {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('La variable MONGO_URL es obligatoria');
  }

  await mongoose.connect(mongoUrl);
  console.log('Conexión a MongoDB establecida');
}