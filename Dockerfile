FROM node:lts-slim as build
RUN apt-get update && apt-get install -y libaio1 wget unzip && \
	rm -rf /var/lib/apt/lists/*
WORKDIR /home/node
COPY package*.json ./
RUN npm install && npm install typescript@latest -g

RUN wget https://download.oracle.com/otn_software/linux/instantclient/217000/instantclient-basiclite-linux.x64-21.7.0.0.0dbru.zip && \
	unzip -o instantclient-basiclite-linux.x64-21.7.0.0.0dbru.zip && \
	rm -f instantclient-basiclite-linux.x64-21.7.0.0.0dbru.zip && \
	cd ./instantclient_21_7 && rm -f *jdbc* *occi* *mysql* *mql1* *ipc1* *jar uidrvci genezi adrci && \
	cd ..
COPY ./credentials/wallet/* instantclient_21_7/network/admin/

COPY tsconfig.json .
COPY src ./src
RUN tsc




FROM node:lts-slim
RUN apt-get update && apt-get install -y libaio1 && \
	rm -rf /var/lib/apt/lists/*
#RUN npm install -g pm2
WORKDIR /home/node
COPY --from=build --chown=node:node /home/node/dist ./
COPY --from=build --chown=node:node /home/node/instantclient_21_7/ ./instantclient_21_7/
COPY --from=build --chown=node:node /home/node/node_modules/ ./node_modules/

RUN echo /home/node/instantclient_21_7 > /etc/ld.so.conf.d/oracle-instantclient.conf && \
	ldconfig
USER node

ENV PORT=8081
ENTRYPOINT [ "/usr/local/bin/node", "/home/node/dogs/container.js" ]
