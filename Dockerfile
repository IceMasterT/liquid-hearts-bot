FROM node:18.18.0 AS base

FROM base AS deps_app
WORKDIR /deps_app
COPY package.json .
RUN apt-get install make git
RUN npm install

FROM base AS app 
WORKDIR /app
COPY --from=deps_app /deps_app/node_modules ./node_modules
COPY . .
CMD ["npm", "start"]
