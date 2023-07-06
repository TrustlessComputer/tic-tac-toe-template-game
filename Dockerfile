# build environment
FROM node:18 as base

FROM base AS deps

WORKDIR /app
COPY package.json ./
COPY yarn.lock* ./
RUN yarn install

# 2. Rebuild the source code only when needed
FROM base AS builder

EXPOSE 6009

ARG BUILD_ENV=production
WORKDIR /app

COPY . ./
# https://create-react-app.dev/docs/adding-custom-environment-variables#what-other-env-files-can-be-used
COPY envs/.env.${BUILD_ENV} .env
COPY --from=deps /app/node_modules ./node_modules
CMD ["yarn", "dev"]
