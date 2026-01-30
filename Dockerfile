# Build stage

FROM node:25-trixie AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# Runtime stage

FROM joseluisq/static-web-server:2-debian AS runtime

RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /www

COPY sws.toml /etc/sws.toml
COPY --from=build /app/dist /www
RUN chown -R app:app /www

USER app

EXPOSE 8080

CMD ["static-web-server", "--config-file", "/etc/sws.toml"]
