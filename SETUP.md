# Writerly — Guía de instalación

## 1. Requisitos previos
- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) (plan gratuito es suficiente)

## 2. Clonar e instalar
```bash
cd writerly
npm install
```

## 3. Configurar Supabase

### 3a. Crear proyecto en Supabase
1. Ve a https://supabase.com → New project
2. Copia la `URL` y la `anon key` del panel Settings → API

### 3b. Crear las tablas
1. En tu proyecto Supabase → SQL Editor
2. Pega y ejecuta el contenido de `supabase/migrations/001_initial.sql`

### 3c. Configurar Auth
1. En Authentication → Providers → Email: activa "Confirm email" si quieres verificación
2. En Authentication → URL Configuration → añade `http://localhost:3000` a los Site URLs

## 4. Variables de entorno
```bash
cp .env.local.example .env.local
```
Edita `.env.local` con tus credenciales de Supabase.

## 5. Ejecutar
```bash
npm run dev
```
Abre http://localhost:3000

## 6. Build de producción
```bash
npm run build
npm start
```

## Estructura de la app
```
/                    → Dashboard (lista de libros)
/login               → Inicio de sesión
/register            → Registro
/forgot-password     → Recuperación de contraseña
/book/[bookId]       → Editor del libro (capítulos + editor TipTap)
```

## Funcionalidades clave
- **Auth**: Registro/Login/Logout con Supabase Auth (email + contraseña)
- **Libros**: Crear, renombrar, eliminar con color de portada personalizable
- **Capítulos**: Drag & Drop para reordenar, edición inline del título
- **Editor**: TipTap con toolbar completa, guardado automático cada 1.5s
- **Exportar**: PDF (jsPDF) o Word (.docx) con selección de capítulos
- **Modo enfoque**: Oculta toda la UI excepto el editor
