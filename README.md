# The Folio — MVP

MVP funcional para registrar hábitos de lectura mediante biblioteca personal, sesiones temporizadas, reflexiones, consulta de palabras, sistema de puntos y rachas.

Desarrollado para el obligatorio de Diseño Interactivo.

## Requisitos

- Node.js 18+
- MongoDB Atlas
- Cuenta/API key de RAE API para la consulta de palabras

## Variables de entorno

Crear `server/.env`:

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/thefolio
JWT_SECRET=clave_larga_segura
CLIENT_URL=http://localhost:5173
PORT=5001
RAE_API_KEY=your_rae_api_key

Crear client/.env:

VITE_API_URL=http://localhost:5001/api
Correr proyecto
Backend
cd server
npm install
npm run dev
Frontend
cd client
npm install
npm run dev
Flujo testeable
Registrarse o iniciar sesión.
Buscar/agregar un libro a la biblioteca.
Entrar a “Leer”.
Elegir tiempo e iniciar sesión.
Consultar una palabra durante la lectura.
Finalizar sesión.
Escribir una reflexión.
Ver los puntos sumados.
Tecnologías utilizadas
React
Vite
Node.js
Express
MongoDB
Mongoose
RAE API
Open Library API
Uso de IA

Se utilizaron herramientas de inteligencia artificial como apoyo durante el proceso de desarrollo, principalmente para generación de código, depuración, organización del proyecto y redacción de documentación.

La funcionalidad principal del MVP no depende de IA generativa. El valor central del producto está en el registro de lectura, sesiones, reflexión, consulta de palabras, puntos y progreso del usuario.
