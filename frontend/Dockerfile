# Step 1: immagine Node per installare dipendenze e build
FROM node:22-alpine AS build
WORKDIR /app
# Copia package.json e package-lock.json (o yarn.lock)
COPY package*.json ./
# Installa le dipendenze
RUN npm install
# Copia tutto il codice frontend
COPY . .
# Costruisci il progetto
RUN npm run build
# Step 2: immagine Nginx per servire i file build
FROM nginx:alpine
# Copia la build dal container precedente
COPY --from=build /app/dist /usr/share/nginx/html
# Copia eventuale configurazione nginx se serve
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# Esponi porta 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
