FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables
ENV REACT_APP_API_URL=http://localhost/api
ENV WDS_SOCKET_HOST=localhost
ENV CHOKIDAR_USEPOLLING=true

# Start development server
CMD ["npm", "start"]
