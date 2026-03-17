FROM node:24-bookworm AS build

WORKDIR /app

# Chrome dependencies for puppeteer
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_SKIP_DOWNLOAD true

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM joseluisq/static-web-server:2-debian AS runtime

WORKDIR /www

COPY sws.toml /etc/sws.toml
COPY --from=build /app/dist /www

USER sws
EXPOSE 8080

CMD ["static-web-server", "--config-file", "/etc/sws.toml"]
