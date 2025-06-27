FROM node:20

# Install dependencies
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg git curl

# Install yt-dlp
RUN pip3 install -U yt-dlp --break-system-packages

# Install yt-dlp-pot-provider via tarball workaround
RUN curl -L https://codeload.github.com/Brainicism/yt-dlp-pot-provider/tar.gz/refs/heads/main -o /tmp/yt-dlp-pot-provider.tar.gz \
  && mkdir -p /tmp/yt-dlp-pot-provider \
  && tar -xzf /tmp/yt-dlp-pot-provider.tar.gz -C /tmp/yt-dlp-pot-provider --strip-components=1 \
  && pip3 install --break-system-packages /tmp/yt-dlp-pot-provider \
  && rm -rf /tmp/yt-dlp-pot-provider.tar.gz /tmp/yt-dlp-pot-provider

# Install bgutils (needed for PO token generation)
RUN curl -fsSL https://bgutils.brainicism.com/install.sh | bash

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
