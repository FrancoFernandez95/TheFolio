# The Folio — MVP base

MVP funcional para registrar lectura, reflexión y puntos.

## Requisitos
- Node.js 18+
- MongoDB Atlas

## Variables de entorno
Crear `server/.env`:

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/thefolio
JWT_SECRET=clave_larga_segura
CLIENT_URL=http://localhost:5173
PORT=5000
```

## Correr proyecto

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Flujo testeable
1. Registrarse.
2. Agregar un libro.
3. Entrar a “Leer”.
4. Elegir tiempo e iniciar sesión.
5. Finalizar sesión con reflexión e imagen opcional.
6. Ver puntos sumados.
