import express from 'express';
import cookieParser from 'cookie-parser';
import eventsRouter from './routes/events.router.js';
import sessionsRouter from './routes/sessions.router.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servidor activo' });
});

app.use('/api/events', eventsRouter);
app.use('/api/sessions', sessionsRouter);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      status: 'error',
      message: 'El cuerpo de la solicitud debe ser JSON válido'
    });
  }

  return next(error);
});

export default app;