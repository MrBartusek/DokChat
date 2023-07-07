FROM node:18

WORKDIR /dokchat

COPY package*.json ./

RUN npm install

COPY src/ src/
COPY public/ public/
COPY tsconfig.json ./
COPY webpack.config.js ./

RUN npm run build

ENV PORT=8080

EXPOSE 8080

CMD [ "npm", "start" ]