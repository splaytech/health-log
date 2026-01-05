# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Set environment variable for Expo
ENV EXPO_USE_STATIC_RENDERING=true
ENV NODE_ENV=production

# Build for web using Expo
RUN npx expo export --platform web

# Production stage with nginx
FROM nginx:alpine

# Copy built files from dist folder (Expo web output)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
