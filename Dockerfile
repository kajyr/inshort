FROM node:15-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn --pure-lockfile --production

COPY . .

EXPOSE 7000

ENTRYPOINT ["./docker-entrypoint.sh"]

