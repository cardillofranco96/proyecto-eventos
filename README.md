# Plataforma de Eventos e Inscripciones

API backend para administrar eventos e inscripciones, con registro, autenticación JWT y sesiones mediante cookies HTTP Only.

## Tecnologías

- Node.js con módulos ES (ESM)
- Express y cookie-parser
- Mongoose
- bcryptjs
- jsonwebtoken

## Instalación y configuración

1. Instalar una versión LTS de Node.js.
2. Instalar las dependencias con `npm install`.
3. Copiar `.env.example` como `.env` y configurar las variables:

| Variable | Valor de ejemplo | Descripción |
| --- | --- | --- |
| `PORT` | `8080` | Puerto HTTP de la aplicación |
| `NODE_ENV` | `development` | Entorno; en `production` las cookies usan `Secure` |
| `MONGO_URL` | `mongodb://localhost:27017/eventos` | URL de conexión a MongoDB |
| `JWT_SECRET` | `replace-with-a-long-random-secret` | Secreto privado usado para firmar y verificar JWT |
| `JWT_EXPIRES_IN` | `1h` | Vigencia del JWT, en formato aceptado por `jsonwebtoken` |

El archivo `.env` está excluido de Git. Usa un secreto aleatorio y exclusivo por entorno; no uses el valor ilustrativo de `.env.example` en producción.

## Ejecución

```bash
npm run dev
```

El servidor espera una conexión activa a MongoDB y queda disponible en `http://localhost:8080` por defecto. Ejecuta las pruebas con `npm test`.

## Rutas disponibles

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/health` | Comprueba que el servidor esté activo |
| `GET` | `/api/events` | Lista eventos (actualmente devuelve una lista vacía) |
| `GET` | `/api/sessions` | Comprueba el router de sesiones |
| `POST` | `/api/sessions/register` | Registra un usuario |
| `POST` | `/api/sessions/login` | Valida credenciales y establece la cookie `currentUser` |
| `GET` | `/api/sessions/current` | Devuelve el usuario de la sesión autenticada |
| `POST` | `/api/sessions/logout` | Elimina la cookie de sesión |

Los ejemplos siguientes asumen que la API está disponible en `http://localhost:8080`.

### `POST /api/sessions/register`

Request:

```json
{
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@example.com",
    "password": "clave-segura-123"
}
```

Respuesta `201`:

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

El email se normaliza a minúsculas y la contraseña se almacena como hash bcrypt. El rol siempre es `user`, aunque se envíe otro valor. Los campos faltantes o inválidos devuelven `400`; un email registrado devuelve `409`. La contraseña nunca se devuelve.

### `POST /api/sessions/login`

Request:

```json
{
    "email": "ana@example.com",
    "password": "clave-segura-123"
}
```

Respuesta `200` (además de `Set-Cookie: currentUser=...; HttpOnly; SameSite=Lax`):

```json
{
    "status": "success",
    "message": "Login correcto"
}
```

La cookie contiene un JWT con vigencia configurable y dura una hora. Campos faltantes devuelven `400`; cualquier credencial incorrecta devuelve el mismo `401`:

```json
{
    "status": "error",
    "message": "Credenciales inválidas"
}
```

### `GET /api/sessions/current`

Requiere enviar la cookie `currentUser` obtenida al iniciar sesión. `curl` puede guardarla durante el login con `-c cookies.txt` y reutilizarla así:

```bash
curl -b cookies.txt http://localhost:8080/api/sessions/current
```

Respuesta `200`:

```json
{
    "status": "success",
    "payload": {
        "id": "...",
        "email": "ana@example.com",
        "role": "user",
        "iat": 1710000000,
        "exp": 1710003600
    }
}
```

Sin cookie, o con un JWT inválido o expirado, responde `401`:

```json
{
    "status": "error",
    "message": "No autenticado"
}
```

### `POST /api/sessions/logout`

No requiere body. Envía la cookie para eliminarla también del cliente:

```bash
curl -X POST -b cookies.txt http://localhost:8080/api/sessions/logout
```

Respuesta `200`:

```json
{
    "status": "success",
    "message": "Sesión cerrada"
}
```