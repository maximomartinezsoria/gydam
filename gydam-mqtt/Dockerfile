FROM node:12 as mqtt

WORKDIR /usr/gydam-mqtt

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
