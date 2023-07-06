FROM node:18

WORKDIR /dokchat

COPY package*.json ./

RUN npm install

COPY . .

RUN git status

RUN npm run build

ENV PORT=8080

EXPOSE 8080

CMD [ "npm", "start" ]