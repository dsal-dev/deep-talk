# Define base image
FROM node:18-alpine AS builder

# Set environment
ARG ARGS_NODE_BUILD
ENV HUSKY=0

# Change working directory
WORKDIR /usr/src/app
ENV NODE_ENV=${NODE_ENV:-development}
ENV ARGS_NODE_BUILD=${ARGS_NODE_BUILD}
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=8192
ENV HUSKY=0

# Copy project folder to docker
COPY . .

# Generate npmrc if not exists
# RUN npm run generateNpmrc

# Install Package Dependencies
RUN npm ci

# Build from source
# RUN npm run build:${ARGS_NODE_BUILD:-development}
RUN npm run build

# Remove .npmrc after build
# RUN rm -rf .npmrc

# Define runtime image
FROM nginx:alpine AS runtime

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

RUN apk update && apk upgrade

# Copy static assets from builder stage
COPY --from=builder /usr/src/app/dist ./
COPY --from=builder /usr/src/app/dist ./app

# Copy nginx conf
COPY nginx/nginx.conf     /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Set entrypoint
CMD ["nginx", "-g", "daemon off;"]
