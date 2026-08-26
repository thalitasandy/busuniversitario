FROM node:20-alpine

WORKDIR /usr/src/app

# Instala dependências primeiro (aproveita cache de camadas do Docker)
COPY package*.json ./
RUN npm install --omit=dev && npm install nodemon --no-save

# Copia o restante do código
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/server.js"]
