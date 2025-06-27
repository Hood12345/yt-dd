FROM node:20

# Install Python, pip, ffmpeg, git, curl
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg git curl

# Install yt-dlp (stable)
RUN pip3 install -U yt-dlp --break-system-packages

# Install yt-dlp PO Token plugin and its dependencies
RUN pip3 install -U yt-dlp-pot-provider --break-system-packages

# Install bgutils (required by yt-dlp-pot-provider plugin)
RUN curl -fsSL https://bgutils.brainicism.com/install.sh | bash

# Ensure plugin is discoverable (optional but safe)
ENV YTDLP_PLUGINS_DIR=/usr/local/lib/python3.*/dist-packages

# Set working directory
WORKDIR /app

# Install Node.js dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
