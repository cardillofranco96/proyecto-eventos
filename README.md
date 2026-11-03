# Plataforma de Eventos e Inscripciones

API backend inicial para administrar eventos y sus inscripciones. Esta base corresponde a la Pre-entrega 1 de Coderhouse y deja preparados los puntos de entrada, rutas, controladores y modelos para continuar el desarrollo.

## Tecnologías

- Node.js con módulos ES (ESM)
- Express
- dotenv
- Mongoose
- bcryptjs

## Instalación

1. Instalar Node.js (se recomienda una versión LTS).
2. Desde la raíz del proyecto, instalar las dependencias:

   ```bash
   npm install
   ```

3. Revisar `.env`. El repositorio incluye valores iniciales; para configurar otro entorno, copiar `.env.example` como `.env` y completar sus variables.

## Variables de entorno

| Variable | Valor inicial | Descripción |
| --- | --- | --- |
Las variables se cargan y centralizan en `src/config/config.js`; el servidor y la conexión a MongoDB consumen esa configuración compartida.
| `PORT` | `8080` | Puerto HTTP de la aplicación |
| `NODE_ENV` | `development` | Entorno de ejecución |
| `MONGO_URL` | `mongodb://localhost:27017/eventos` | URL prevista para la conexión a MongoDB |
| `JWT_SECRET` | `coderSecret` | Secreto inicial previsto para JWT; reemplazar antes de usar en producción |

El archivo `.env` está ignorado por Git. No se deben compartir secretos reales ni usar los valores de ejemplo en producción.

## Ejecución

Modo desarrollo, con reinicio al cambiar archivos:

```bash
npm run dev
```

Modo normal:

Ejecuta las pruebas unitarias y smoke tests con:

```bash
npm test
```

```bash
npm start
```

La API queda disponible en `http://localhost:8080` por defecto. Se puede cambiar el puerto definiendo `PORT` en `.env`. El servidor espera una conexión activa con MongoDB usando `MONGO_URL` antes de comenzar a escuchar.

## Estructura

```text
proyecto-eventos/
├── .env.example
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── events.controller.js
│   │   └── sessions.controller.js
│   ├── dao/
│   │   └── users.dao.js
│   ├── middlewares/
│   │   └── .gitkeep
│   ├── models/
│   │   ├── Event.js
│   │   └── User.js
│   ├── repositories/
│   │   └── users.repository.js
│   ├── routes/
│   │   ├── events.router.js
│   │   └── sessions.router.js
│   ├── services/
│   │   └── sessions.service.js
│   └── utils/
│       └── hash.js
└── test/
    └── sessions.service.test.js
```

## Endpoints disponibles

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `GET` | `/api/health` | `200` con estado `ok` y mensaje `Servidor activo` |
| `GET` | `/api/events` | `200` con estado `success` y `payload` vacío |
| `GET` | `/api/sessions` | `200` con estado `success` y mensaje `Ruta de sessions inicializada` |
| `POST` | `/api/sessions/register` | `201` con los datos públicos del usuario registrado |

### Registro de usuarios

Con MongoDB en ejecución y el servidor iniciado con `npm run dev`, envía un `POST` a `http://localhost:8080/api/sessions/register` con `Content-Type: application/json`:

```bash
curl -X POST http://localhost:8080/api/sessions/register \
    -H "Content-Type: application/json" \
    -d '{"first_name":"Ana","last_name":"Pérez","email":"ana@example.com","password":"clave-segura-123"}'
```

El cuerpo JSON debe incluir `first_name`, `last_name`, `email` y `password`:

```json
{
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@example.com",
    "password": "clave-segura-123",
    "role": "admin"
}
```

Los cuatro campos indicados son obligatorios. El email se normaliza a minúsculas y se eliminan sus espacios externos; la contraseña debe tener al menos 6 caracteres y se almacena como hash bcrypt con 10 rondas. El rol siempre se asigna como `user`, por lo que cualquier `role` enviado se ignora.

Respuesta de éxito (`201`):

```json
{
    "status": "success",
    "payload": {
        "id": "...",
        "first_name": "Ana",
        "last_name": "Pérez",
        "email": "ana@example.com",
        "role": "user"
    }
}
```

El campo `password` nunca se incluye en la respuesta. Datos inválidos o campos faltantes devuelven `400` (`{"status":"error","message":"Faltan campos obligatorios"}` para campos faltantes); un email registrado devuelve `409` (`{"status":"error","message":"El email ya está registrado"}`). Los errores inesperados devuelven `500`.