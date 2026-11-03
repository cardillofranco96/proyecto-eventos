import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/database.js';

const port = process.env.PORT || 8080;

try {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
  });
} catch (error) {
  console.error('No se pudo conectar a MongoDB:', error.message);
  process.exitCode = 1;
}
