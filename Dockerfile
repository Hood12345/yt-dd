FROM node:20

# Install system dependencies
RUN apt-get update \
 && apt-get install -y python3 python3-pip ffmpeg curl

# Install yt-dlp (>=2025.05.22) and PO-token plugin
RUN pip3 install -U yt-dlp bgutil-ytdlp-pot-provider --break-system-packages

# Install bgutils provider server binary
RUN curl -fsSL https://bgutils.brainicism.com/install.sh | bash

# Copy Node.js service code
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Expose both service port and PO-token provider port
EXPOSE 3000 4416

# Start both services
CMD bash -lc "\
  bgutil-ytdlp-pot-provider & \
  node index.js \
"
