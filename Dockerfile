FROM node:18.2.0-alpine3.15
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV="production"

EXPOSE 3002
CMD ["npm", "run", "server"]