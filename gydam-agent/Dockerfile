FROM node:12 as agent

WORKDIR /usr/gydam-agent

COPY ./package*.json ./

RUN npm install

COPY . .
