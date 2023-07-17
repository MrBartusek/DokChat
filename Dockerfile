FROM node:18

WORKDIR /dokchat

COPY package*.json ./

RUN npm install

COPY src/ src/
COPY public/ public/
COPY tsconfig.json ./
COPY webpack.config.js ./

ENV NODE_ENV=production

RUN npm run build

EXPOSE $PORT
EXPOSE 3000

CMD [ "npm", "start" ]