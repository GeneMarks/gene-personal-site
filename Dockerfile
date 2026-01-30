# Build stage

FROM node:25-trixie AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# Runtime stage

FROM joseluisq/static-web-server:2-debian AS runtime

WORKDIR /www

COPY sws.toml /etc/sws.toml
COPY --from=build /app/dist /www

USER sws
EXPOSE 8080

CMD ["static-web-server", "--config-file", "/etc/sws.toml"]
