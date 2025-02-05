FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install @nestjs/cli --global 

COPY . .

EXPOSE 3002

CMD [ "nest", "start", "message-worker","--watch" ]