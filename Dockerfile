FROM dhi.io/bun:1-alpine3.22-dev AS build
WORKDIR /home/node
COPY package*.json pnpm* bun* *.patch ./

RUN bun install --frozen-lockfile

COPY ./credentials/wallet/* instantclient/network/admin/

COPY tsconfig.json .
COPY src ./src
RUN bun build ./src/dogs/container.ts --outdir ./dist --target bun



FROM dhi.io/bun:1-alpine3.22
WORKDIR /home/node
COPY --from=build --chown=node:node /home/node/dist ./
COPY --from=build --chown=node:node /home/node/instantclient/ ./instantclient/
COPY --from=build --chown=node:node /home/node/node_modules/ ./node_modules/

USER node

ENV PORT=8081
ENTRYPOINT [ "bun", "run", "/home/node/dogs/container.js" ]
