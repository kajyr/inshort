FROM node:14.11-alpine3.12 AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn --pure-lockfile

COPY . .
RUN yarn build:frontend

FROM node:14.11-alpine3.12 AS prod_builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn --pure-lockfile --production

FROM node:14.11-alpine3.12 AS prod

WORKDIR /app

COPY --from=prod_builder /app/node_modules node_modules
COPY --from=builder /app/public public

COPY migrations migrations
COPY public public
COPY backend backend
COPY package.json yarn.lock entrypoint.sh knexfile.js ./

RUN mkdir /data 
EXPOSE 4445

ENTRYPOINT ["./entrypoint.sh"]

CMD [ "diario-blu" ] 
