# Contexte de build attendu : la racine du dépôt (référence database/).
FROM node:22-alpine
WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/src ./src
COPY database /database

ENV NODE_ENV=production
CMD ["node", "src/index.js"]
