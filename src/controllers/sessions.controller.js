import {
  loginUser,
  LoginError,
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

export async function login(req, res) {
  try {
    const { token } = await loginUser(req.body);
    res.cookie('currentUser', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 3600000,
      secure: process.env.NODE_ENV === 'production'
    });

    return res.status(200).json({
      status: 'success',
      message: 'Login correcto'
    });
  } catch (error) {
    if (error instanceof LoginError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message
      });
    }

    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
}

export function current(req, res) {
  return res.status(200).json({ status: 'success', payload: req.user });
}

export function logout(req, res) {
  res.clearCookie('currentUser', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  return res.status(200).json({
    status: 'success',
    message: 'Sesión cerrada'
  });
}