FROM node:20.9-alpine
LABEL authors="philo"

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package.json package.json
COPY --chown=node:node package-lock.json package-lock.json

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8081

CMD ["node", "app.js"]

