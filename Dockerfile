FROM mhart/alpine-node:7

RUN apk update && apk upgrade \
  && apk add ca-certificates \
  && rm -rf /var/cache/apk/*

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
COPY package.json /tmp/package.json
RUN cd /tmp && npm install --production
RUN mkdir -p /app && mv /tmp/node_modules /app

# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
WORKDIR /app
COPY . /app

EXPOSE 3000
CMD ["node", "app.js"]
