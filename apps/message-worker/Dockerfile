FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install @nestjs/cli --global 

COPY . .

RUN npm run build

EXPOSE 4000

CMD [ "nest", "start", "message-worker","--watch" ]