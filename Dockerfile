FROM node:20

# Install Python, pip, ffmpeg, git
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg git curl

# Install yt-dlp
RUN pip3 install -U yt-dlp --break-system-packages

# Clone and install PO Token provider
RUN git clone https://github.com/Brainicism/yt-dlp-pot-provider.git /tmp/yt-dlp-pot-provider && \
    pip3 install --break-system-packages /tmp/yt-dlp-pot-provider && \
    rm -rf /tmp/yt-dlp-pot-provider

# Install bgutils (required for token generation)
RUN curl -fsSL https://bgutils.brainicism.com/install.sh | bash

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]

