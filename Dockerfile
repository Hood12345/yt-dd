FROM node:20

# Install required system dependencies (added bash)
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg git curl unzip bash

# Install yt-dlp
RUN pip3 install -U yt-dlp --break-system-packages

# Download and install yt-dlp-pot-provider
RUN curl -L https://codeload.github.com/Brainicism/yt-dlp-pot-provider/zip/refs/heads/main -o /tmp/yt-dlp-pot-provider.zip \
  && unzip /tmp/yt-dlp-pot-provider.zip -d /tmp \
  && pip3 install --break-system-packages /tmp/yt-dlp-pot-provider-main \
  && rm -rf /tmp/yt-dlp-pot-provider.zip /tmp/yt-dlp-pot-provider-main

# Install bgutils (requires bash)
RUN curl -fsSL https://bgutils.brainicism.com/install.sh | bash

# Setup Node.js app
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
