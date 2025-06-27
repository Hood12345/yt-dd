FROM node:20

# Install Python, pip, ffmpeg
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg git curl

# Install yt-dlp
RUN pip3 install -U yt-dlp --break-system-packages

# Install yt-dlp plugin for PO Token support
RUN pip3 install -U yt-dlp-pot-provider

# Install bgutils (required by the plugin)
RUN curl -fsSL https://bgutils.brainicism.com/install.sh | bash

# Set working directory
WORKDIR /app

# Copy Node.js files
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
