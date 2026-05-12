FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm config set fetch-retry-maxtimeout 600000

RUN npm install --legacy-peer-deps --fetch-timeout=600000

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

