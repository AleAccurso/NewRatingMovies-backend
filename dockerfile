FROM node:16.12.0-alpine as backend

RUN npm install -g npm@8.5.5

RUN mkdir -p /backend
WORKDIR /backend

# RUN apk add -no-cache nodejs npm

# Install app dependencies
COPY package.json ./

# update and install dependencies
RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
# COPY . .
ADD . /backend/

CMD [ "npm", "run", "start" ]

EXPOSE 8010