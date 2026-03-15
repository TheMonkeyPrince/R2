FROM node:20-alpine

ARG DATABASE_URL

WORKDIR /usr/src/app

# Install ffmpeg (required for audio processing)
RUN apk add --no-cache ffmpeg

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source, build, and expose port
COPY . .

ENV DATABASE_URL=${DATABASE_URL}
RUN npm run build

COPY ./docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8081

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
