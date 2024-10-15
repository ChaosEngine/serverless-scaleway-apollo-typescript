FROM node:lts-alpine as build
WORKDIR /home/node
COPY package*.json pnpm* *.patch ./

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add patch

RUN pnpm install && pnpm add typescript@latest -g
RUN patch --directory=node_modules/oracledb --strip=1 < 1697-lib-thin-connection.patch

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
