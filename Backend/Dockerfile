
FROM node:20-alpine

WORKDIR /app

# Install FFmpeg
RUN apk update && apk add ffmpeg

COPY package.json .

RUN npm install

COPY . .

# Create necessary directories and set permissions
RUN mkdir -p /app/public/uploads /app/public/hls /app/public/hls/profilePictures && \
    chmod -R 777 /app/public/uploads /app/public/hls && \
    chown -R node:node /app/public

# Set environment variable to indicate Docker environment
ENV DOCKER_ENV=true
ENV NODE_ENV=production



EXPOSE 3000

CMD ["node", "app.js"]
