# Guía de Despliegue — Paradise Lamb Invoicing

## Opción 1: Railway (Recomendada para no técnicos)

Railway es la opción más fácil. Tiene plan gratuito y no requiere configuración de servidor.

### Paso 1 — Instalar herramientas

1. Descarga e instala **Node.js**: https://nodejs.org (versión 20 LTS)
2. Crea una cuenta gratuita en **GitHub**: https://github.com
3. Crea una cuenta gratuita en **Railway**: https://railway.app

### Paso 2 — Subir el código a GitHub

1. Abre la Terminal (Mac) o PowerShell (Windows)
2. Entra a la carpeta del proyecto:
   ```bash
   cd /ruta/a/paradise-lamb-invoicing
   ```
3. Inicializa git y sube:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
4. En GitHub, crea un repositorio nuevo (botón verde "New")
5. Copia los comandos que GitHub te da y pégalos en la terminal

### Paso 3 — Desplegar en Railway

1. En railway.app, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Elige tu repositorio
4. Railway detectará automáticamente que es Next.js

### Paso 4 — Agregar base de datos PostgreSQL (para producción)

1. En tu proyecto de Railway, haz clic en **"+ New"**
2. Selecciona **"Database" → "PostgreSQL"**
3. Railway creará la base de datos y te dará una variable `DATABASE_URL`
4. Actualiza el archivo `prisma/schema.prisma`:
   - Cambia `provider = "sqlite"` por `provider = "postgresql"`

### Paso 5 — Variables de entorno en Railway

En tu proyecto Railway → Settings → Variables, agrega:
```
DATABASE_URL = [la que Railway te dio automáticamente]
```

### Paso 6 — Listo

Railway te dará una URL pública tipo: `https://tu-proyecto.railway.app`

---

## Opción 2: Vercel (Alternativa para frontend)

⚠️ Vercel no soporta SQLite en producción. Necesitas una base de datos externa.

### Con Neon (PostgreSQL gratuito)

1. Crea cuenta en https://neon.tech (gratis)
2. Crea una base de datos y copia la URL de conexión
3. En `prisma/schema.prisma` cambia `sqlite` por `postgresql`
4. Ve a https://vercel.com → importa tu repo de GitHub
5. Agrega la variable `DATABASE_URL` en Vercel → Settings → Environment Variables

---

## Uso local (desarrollo)

```bash
# 1. Instalar dependencias
npm install

# 2. Crear base de datos
npm run db:push

# 3. Iniciar la app
npm run dev

# 4. Abre http://localhost:3000
```

---

## Configurar correo (Gmail)

1. Ve a tu cuenta Google → Seguridad → Verificación en 2 pasos (actívala)
2. Ve a Seguridad → Contraseñas de aplicación
3. Genera una contraseña para "Correo"
4. En la app, ve a Configuración y pega:
   - Servidor: `smtp.gmail.com`
   - Puerto: `587`
   - Usuario: `tu@gmail.com`
   - Contraseña: la contraseña de aplicación de 16 caracteres
   - Remitente: `Paradise Lamb Agency <tu@gmail.com>`
