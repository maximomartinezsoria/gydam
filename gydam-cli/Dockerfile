FROM node:12 as cli

WORKDIR /usr/gydam-cli

COPY ./package*.json ./

RUN npm install

COPY . .

CMD ["./gydam.js"]