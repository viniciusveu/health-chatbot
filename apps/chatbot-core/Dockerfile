FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install @nestjs/cli --global 

COPY . .

RUN npm run build

CMD [ "nest", "start", "chatbot-core", "--watch" ]