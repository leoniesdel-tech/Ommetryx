# Ommetryx-App für den Server. Bau vom Hauptordner aus, weil die App die Empfehlungslogik aus packages/ braucht.
# Dev-Abhängigkeiten bleiben drin: Der tägliche Pflege-Lauf startet über tsx.
FROM node:24-alpine
RUN apk add --no-cache openssl

WORKDIR /srv
COPY packages/empfehlung packages/empfehlung
COPY shopify-app shopify-app

WORKDIR /srv/packages/empfehlung
RUN npm ci --omit=dev

WORKDIR /srv/shopify-app
RUN npm ci --include=dev && npx prisma generate && NODE_ENV=production npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
