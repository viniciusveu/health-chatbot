FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install @nestjs/cli --global 

COPY . .

EXPOSE 3001

CMD [ "nest", "start", "event-worker", "--watch" ]