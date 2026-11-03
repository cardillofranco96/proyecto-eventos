import app from './app.js';
import config from './config/config.js';
import { connectDatabase } from './config/database.js';

try {
  await connectDatabase();
  app.listen(config.PORT, () => {
    console.log(`Servidor escuchando en el puerto ${config.PORT}`);
  });
} catch (error) {
  console.error('No se pudo conectar a MongoDB:', error.message);
  process.exitCode = 1;
}
