# Multi-stage build

# Stage 1: Build the Vite React App (React 19, Tailwind)
FROM node:22-alpine AS builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
# We will create Vite config and app in next step
RUN npm run build

# Stage 2: Setup the Express Server
FROM node:22-alpine

WORKDIR /app

# Install dependencies for the server
COPY package*.json ./
RUN npm install --production
COPY server/ ./server/

# Copy built client from stage 1
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3000

CMD ["node", "--no-warnings", "server/app.js"]
