FROM node:20

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy all backend code
COPY . .

# Expose backend port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start backend with dev script (runs seed then server)
CMD ["npm", "run", "dev"]