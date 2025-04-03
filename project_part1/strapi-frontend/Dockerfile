FROM node:18-alpine3.18

WORKDIR /usr/app/

COPY . .

RUN npm i

EXPOSE 5173

CMD [ "yarn", "dev" ]