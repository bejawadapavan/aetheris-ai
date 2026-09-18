# Stage 1: Build the React Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production Server & Deployment
FROM node:20-alpine
WORKDIR /app/server

# Install server dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server source
COPY server/ ./

# Copy built frontend assets from Stage 1 into client/dist
COPY --from=client-builder /app/client/dist /app/client/dist

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose production deployment ports
EXPOSE 5000 8000

# Start unified full-stack application
CMD ["node", "server.js"]
