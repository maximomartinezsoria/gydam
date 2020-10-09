FROM node:12 as utils

WORKDIR /usr/gydam-utils

COPY ./package*.json ./

RUN npm install

COPY . .