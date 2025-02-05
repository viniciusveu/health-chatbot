FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install @nestjs/cli --global 

COPY . .

EXPOSE 3000

CMD [ "nest", "start", "chatbot","--watch" ]