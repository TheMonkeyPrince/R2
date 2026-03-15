FROM node:20-alpine AS builder
WORKDIR /app

# install dependencies (including dev deps required for build)
COPY package.json package-lock.json* ./
RUN npm install --verbose || npm install --no-audit

# copy source and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
