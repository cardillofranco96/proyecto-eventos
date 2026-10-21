# Plataforma de Eventos e Inscripciones

API backend inicial para administrar eventos y sus inscripciones. Esta base corresponde a la Pre-entrega 1 de Coderhouse y deja preparados los puntos de entrada, rutas, controladores y modelos para continuar el desarrollo.

## Tecnologías

- Node.js con módulos ES (ESM)
- Express
- dotenv

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

```bash
npm start
```

La API queda disponible en `http://localhost:8080` por defecto. Se puede cambiar el puerto definiendo `PORT` en `.env`.

## Estructura

```text
proyecto-eventos/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   └── .gitkeep
    ├── controllers/
    │   ├── events.controller.js
    │   └── sessions.controller.js
    ├── dao/
    │   └── .gitkeep
    ├── middlewares/
    │   └── .gitkeep
    ├── models/
    │   ├── Event.js
    │   └── User.js
    ├── repositories/
    │   └── .gitkeep
    ├── routes/
    │   ├── events.router.js
    │   └── sessions.router.js
    ├── services/
    │   └── .gitkeep
    └── utils/
        └── .gitkeep
```

## Endpoints disponibles

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `GET` | `/api/health` | `200` con estado `ok` y mensaje `Servidor activo` |
| `GET` | `/api/events` | `200` con estado `success` y `payload` vacío |
| `GET` | `/api/sessions` | `200` con estado `success` y mensaje `Ruta de sessions inicializada` |

Los modelos `User` y `Event` son estructuras iniciales. La persistencia, autenticación e inscripciones todavía no están implementadas.