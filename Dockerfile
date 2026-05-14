FROM dhi.io/bun:1-alpine3.22-dev AS build
WORKDIR /home/nonroot
COPY package*.json pnpm* bun* *.patch ./

RUN bun install --frozen-lockfile

COPY ./credentials/wallet/* instantclient/network/admin/
COPY src ./src

RUN bun build ./src/dogs/container.ts --outdir ./dist --target bun



FROM dhi.io/bun:1-alpine3.22
WORKDIR /home/nonroot
COPY --from=build --chown=nonroot:nonroot /home/nonroot/dist ./
COPY --from=build --chown=nonroot:nonroot /home/nonroot/instantclient/ ./instantclient/
COPY --from=build --chown=nonroot:nonroot /home/nonroot/node_modules/ ./node_modules/

USER nonroot

ENV PORT=8081
ENTRYPOINT [ "bun", "run", "/home/nonroot/container.js" ]
