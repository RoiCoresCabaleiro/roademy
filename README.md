# Roademy

## Introducción

**Roademy** es una aplicación educativa orientada a niños de primaria para aprender **educación vial** de forma interactiva y ligeramente gamificada. También ofrece acceso a profesores, padres o tutores para que monitoricen el progresos de sus estudiantes.

El proyecto consiste de un backend (**API REST**) en **Node.js/Express** con base de datos **MySQL** y un frontend en **React (Vite + TailwindCSS)**. 

Se ha desarrollado también una **aplicación móvil híbrida** para Androind usando **Capacitor**. 

<br><br>

## Acceso

A fecha de `31/8/2025` la aplicación se encuentra hosteada de la siguiente manera:

- **Backend** → Railway
- **Frontend** → Vercel 

La versión de navegador se encuentra disponible en el siguiente enlace: [roademy.vercel.app](https://roademy.vercel.app/)

En la raíz del repo se encuentra el archivo `roademy.apk`, que es una versión de la apk que se conecta directamente a la API hosteada en railway.

<br><br>

## Manual de instalación y configuración

Este documento está pensado como guía práctica para desarrolladores que deseen levantar el proyecto en su propio entorno.

<br>

### 1. Requisitos previos

Asegúrate de tener instalado en tu sistema:

- **Git**
- **Docker Desktop** (o similar)
- **Node.js LTS** (versión 20 o superior)
- **Android Studio** (opcional)

<br>

### 2. Clonar el repositorio

```bash
git clone https://github.com/RoiCoresCabaleiro/roademy.git
cd roademy
```

Dentro del repositorio encontrarás las carpetas principales:

* `server/` → backend (Express + Sequelize)
* `app/` → frontend (React + Vite + Capacitor)

<br>

### 3. Configuración del backend (server/)

#### 3.1. Instalar dependencias

```bash
cd server
npm install
```

#### 3.2. Crear archivo `.env`

En la raíz de la carpeta `server/` crea un archivo `.env` con las siguientes variables (ejemplo):

```env
NODE_ENV=dev         # usar "dev" en desarrollo, "prod" en producción
PORT=3000

DB_HOST=db
DB_PORT=3306
DB_NAME=aplicacion_db
DB_USER=db_user
DB_PASS=db_pass123

JWT_SECRET=tu_clave_secreta
```

#### 3.3. Levantar el backend con Docker

Desde la carpeta raíz del proyecto:

```bash
docker-compose up --build
```

Esto iniciará dos contenedores:

* **db** → MySQL
* **server** → Node.js/Express

El backend quedará disponible por defecto en `http://localhost:3000`

<br>

### 4. Configuración del frontend (app/)

#### 4.1. Instalar dependencias

```bash
cd app
npm install
```

#### 4.2. Crear archivo `.env`

En la raíz de la carpeta server/ crea un archivo .env con el siguiente contenido:

```env
VITE_API_URL=/api
```

En `server/vite.config.js` hay un proxy configurado para redirigir las peticiones a `/api` a `http://localhost:3000`

<br>

### 5. Ejecutar el frontend en desarrollo

Para iniciar el servidor de Vite:

```bash
npm run dev
```

Esto arrancará la aplicación en `http://localhost:5173`

Si habilitas `host: true` en `vite.config.js`, la aplicación será accesible desde dispositivos en tu red local en una ip con la forma: `http://192.168.x.y:5173`, necesario para conectarse desde de la APK a través de tu red local.

<br>

### 6. Uso con dispositivos móviles (Capacitor + APK)

La aplicación puede compilarse como APK para Android usando Capacitor.

#### 6.1. Configurar `capacitor.config.json`

Debes crear manualmente el archivo `app/capacitor.config.json` con el siguiente contenido:

```json
{
  "appId": "com.android.roademy",
  "appName": "Roademy",
  "webDir": "dist",
  "server": {
    "url": "http://192.168.x.y:5173",
    "cleartext": true
  }
}
```
Ajusta el valor de `url` según la ip de host de tu máquina.

#### 6.2. Construir la aplicación web e integrar en Capacitor

```bash
npm run build
npx cap sync android
```

Esto genera la carpeta `dist/` y copia el contenido al proyecto Android.

#### 6.3. Compilar la APK


```bash
cd android
./gradlew assembleDebug
```

La APK quedará disponible en:

```
roademy/app/android/app/build/outputs/apk/debug/app-debug.apk
```

O bien abrir la carpeta `android/` en **Android Studio** y usar el menú:
`Build → Build Bundle(s) / APK(s) → Build APK(s)`.

