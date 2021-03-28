FROM node:lts-slim as build
RUN apt-get update && apt-get install -y libaio1 wget unzip && \
	rm -rf /var/lib/apt/lists/*
WORKDIR /home/node
COPY package*.json ./
RUN npm install && npm install typescript@latest -g

RUN wget https://download.oracle.com/otn_software/linux/instantclient/211000/instantclient-basiclite-linux.x64-21.1.0.0.0.zip && \
	unzip -o instantclient-basiclite-linux.x64-21.1.0.0.0.zip && \
	rm -f instantclient-basiclite-linux.x64-21.1.0.0.0.zip && \
	cd ./instantclient_21_1 && rm -f *jdbc* *occi* *mysql* *mql1* *ipc1* *jar uidrvci genezi adrci && \
	cd ..
COPY ./credentials/wallet/* instantclient_21_1/network/admin/

COPY tsconfig.json .
COPY src ./src
RUN tsc




FROM node:lts-slim
RUN npm install -g pm2
COPY --from=build /home/node/ ./app/

RUN echo /app/instantclient_21_1 > /etc/ld.so.conf.d/oracle-instantclient.conf && \
	ldconfig

ENV PORT=8080
CMD exec node /app/src/dogs/container.js
