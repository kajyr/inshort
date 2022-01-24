FROM node:16-alpine

ENV NODE_ENV production
RUN mkdir /data

WORKDIR /app

COPY backend ./backend
COPY public ./public

WORKDIR /app/backend
RUN npm ci

EXPOSE 7000

ENTRYPOINT ["npm", "start"]

