FROM node:20-alpine AS base
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["node", "--loader", "ts-node/esm", "src/server.ts"]
