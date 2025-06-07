# 1. Usar una imagen base de Node LTS, ligera (Alpine)
FROM node:20-alpine

# 2. Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# 4. Instalar dependencias
RUN npm install

# 5. Copiar el resto del código fuente
COPY . .

# 6. Exponer el puerto en el que Express escuchará
EXPOSE 3000

# 7. Comando de inicio
CMD ["npm", "run", "start"]
