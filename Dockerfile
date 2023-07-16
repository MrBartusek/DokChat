FROM node:18

WORKDIR /dokchat

COPY package*.json ./

RUN npm install

COPY src/ src/
COPY public/ public/
COPY tsconfig.json ./
COPY webpack.config.js ./

RUN npm run build

ENV PORT=3000

EXPOSE $PORT

CMD [ "npm", "start" ]