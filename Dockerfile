FROM node:14.20.0

ENV OPENSSL_CONF=/dev/null

# Create app directory
WORKDIR /usr/src/

RUN apt-get update \
    && apt-get install -y curl nano \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN npm install

EXPOSE 8000

CMD ["npm", "start"]
