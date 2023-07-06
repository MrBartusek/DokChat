FROM node:18

WORKDIR /dokchat

COPY package*.json ./

RUN npm install

ADD . .

RUN ls -a

RUN npm run build

ENV PORT=8080

EXPOSE 8080

CMD [ "npm", "start" ]