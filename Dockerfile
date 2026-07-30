# --- Etapa de build ---
FROM node:22-alpine AS build
WORKDIR /app

# Cachear dependencias en una capa aparte: solo se reinstalan si el lockfile cambia.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# import.meta.env.VITE_* de Vite se resuelve en build time, no en runtime:
# esta imagen queda atada a la URL de API con la que se construyo.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# --- Etapa de runtime ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
