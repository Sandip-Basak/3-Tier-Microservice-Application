# Use official Node.js runtime as lightweight base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads

# Expose backend port
EXPOSE 4000

# Set environment variables default values
ENV PORT=4000
ENV NODE_ENV=production

# Start application
CMD ["node", "server.js"]
