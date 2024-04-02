FROM node:20.11.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install pm2 -g

RUN npm run build

EXPOSE 3000

CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
