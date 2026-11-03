import {
  registerUser,
  RegistrationError
} from '../services/sessions.service.js';

export function getSessions(req, res) {
  res.status(200).json({
    status: 'success',
    message: 'Ruta de sessions inicializada'
  });
}

export async function register(req, res) {
  try {
    const user = await registerUser(req.body);
    return res.status(201).json({ status: 'success', payload: user });
  } catch (error) {
    if (error instanceof RegistrationError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message
      });
    }

    console.error('Error al registrar usuario:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
}