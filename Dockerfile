FROM node:lts-alpine as build
WORKDIR /home/node
COPY package*.json ./
RUN npm install && npm install typescript@latest -g

COPY ./credentials/wallet/* instantclient/network/admin/

COPY tsconfig.json .
COPY src ./src
RUN tsc




FROM node:lts-alpine
WORKDIR /home/node
COPY --from=build --chown=node:node /home/node/dist ./
COPY --from=build --chown=node:node /home/node/instantclient/ ./instantclient/
COPY --from=build --chown=node:node /home/node/node_modules/ ./node_modules/

USER node

ENV PORT=8081
ENTRYPOINT [ "/usr/local/bin/node", "/home/node/dogs/container.js" ]
