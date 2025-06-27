FROM node:20

# Install Python + yt-dlp + ffmpeg
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg \
  && pip3 install -U yt-dlp-nightly --break-system-packages

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
