# Build Stage
FROM node:22-alpine AS builder
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build

# Production Stage
FROM node:22-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/libs/database/prisma ./libs/database/prisma 
CMD ["node", "dist/apps/chatbot/main.js"]
