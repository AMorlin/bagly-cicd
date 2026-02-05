FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
ARG APP_VERSION=dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV VITE_APP_VERSION=${APP_VERSION}
RUN npm run build

FROM nginx:alpine AS runner
RUN apk update && apk upgrade --no-cache
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
