FROM node:20

# Install required system dependencies
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg git curl unzip

# Install yt-dlp
RUN pip3 install -U yt-dlp --break-system-packages

# Download and install yt-dlp-pot-provider from GitHub ZIP release
RUN curl -L https://github.com/Brainicism/yt-dlp-pot-provider/archive/refs/heads/main.zip -o /tmp/yt-dlp-pot-provider.zip \
  && unzip /tmp/yt-dlp-pot-provider.zip -d /tmp \
  && pip3 install --break-system-packages /tmp/yt-dlp-pot-provider-main \
  && rm -rf /tmp/yt-dlp-pot-provider.zip /tmp/yt-dlp-pot-provider-main

# Install bgutils (needed for PO token generation)
RUN curl -fsSL https://bgutils.brainicism.com/install.sh | bash

# Node.js App Setup
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
