FROM node:16.14.0-alpine

RUN mkdir -p /opt/backend
WORKDIR /opt/backend

# RUN apk add -no-cache nodejs npm

# Install app dependencies
COPY package.json ./

# update and install dependencies
RUN apk update
RUN apk upgrade
RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

CMD [ "npm", "run", "dev" ]

EXPOSE 8010