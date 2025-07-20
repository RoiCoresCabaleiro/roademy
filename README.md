# Roademy


## Manual de instalación

Como no se ha desplegado en producción, para usarla en local debes clonar el repositorio, instalar dependencias y levantar tanto el servidor (API REST) como el cliente web. A continuación, el proceso detallado.

---

### 1. Requisitos previos

- **Git**  
- **Docker Desktop** (o similar)  
- **Node.js LTS** (v20 o superior)  

---

### 2. Clonar el repositorio

```bash
git clone https://github.com/RoiCoresCabaleiro/roademy.git
cd roademy
```

Dentro verás dos carpetas principales:

- `server/` — backend (Node.js + Express + MySQL + Sequelize)  
- `app/` — cliente web (React + Vite + TailwindCSS + Capacitor)  

---

### 3. Levantar el **backend** con Docker

#### 3.1 Instalar dependencias

```bash
cd server
npm install
```

#### 3.2 Crear archivo `.env`

En `server/.env` define tus variables de entorno (valores de ejemplo):

```dotenv
# Puerto de escucha de la API
PORT=3000

# Conexión a MySQL
DB_HOST=localhost
DB_NAME=roademy_db
DB_USER=mi_usuario
DB_PASS=mi_contraseña_segura
DB_PORT=3306

# Clave para firmar JWT
JWT_SECRET=TU_JWT_SECRET_ALEATORIO
```

#### 3.3 Construir y levantar contenedores

```bash
docker-compose up --build
```

- Inicia un contenedor Node.js para la API y otro para la BD MySQL.  
- La API escuchará en `http://localhost:3000` por defecto.

---

### 4. Levantar el **cliente web** con Vite

```bash
cd app
npm install
npm run dev
```

- La app React arranca en modo desarrollo en `http://localhost:5173`. Permite acceder a la versión de navegador de la aplicacion.  
- Si en `vite.config.js` se configura `"host": true`, podrás acceder a la interfaz desde otros dispositivos de tu red local conectandote a través de la ip local del ordenador host, algo como: `http://192.168.x.y:5173` 

---

### 5. Acceso a la versión móvil (APK)

La web se empaqueta con Capacitor para Android. En desarrollo necesitas apuntar al servidor Vite levantado en el paso anterior.

#### 5.1 Modificar `app/capacitor.config.json`

Cambia la URL del servidor por la IP local de tu equipo (la que muestra Vite al arrancar). Ejemplo:

```jsonc
{
  "appId": "com.android.roademy",
  "appName": "Roademy",
  "webDir": "dist",
  "server": {
    "url": "http://192.168.1.100:5173",
    "cleartext": true
  }
}
```

#### 5.2 Construir la web y sincronizar con Capacitor

```bash
npm run build
npx cap sync
```

- `build` genera `dist/` con la web optimizada.  
- `cap sync` actualiza el proyecto Android, copiando `dist/` y la configuración.

#### 5.3 Generar la APK de desarrollo

```bash
cd android
./gradlew assembleDebug
```

- Obtendrás `android/app/build/outputs/apk/debug/app-debug.apk`, lista para instalar en Android.

Alternativamente, abre el proyecto en **Android Studio** y selecciona:

```
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

- La apk resultante se guarda en el **mismo directorio** que al ejecutar el `assembleDebug`.

