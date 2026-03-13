# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Pass in specific environment variables into the Vite Build Context
ARG VITE_JAVA_API_URL
ARG VITE_PYTHON_API_URL
ENV VITE_JAVA_API_URL=$VITE_JAVA_API_URL
ENV VITE_PYTHON_API_URL=$VITE_PYTHON_API_URL

# Build the React application
RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy the build output from the build stage to NGINX HTML folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for NGINX
EXPOSE 80

# Run NGINX in foreground
CMD ["nginx", "-g", "daemon off;"]
