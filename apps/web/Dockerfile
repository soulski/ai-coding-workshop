FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --no-package-lock

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
