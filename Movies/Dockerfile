FROM node:20-alpine as base
WORKDIR /usr/src/app
EXPOSE 3003

FROM base as dev
RUN --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=package-lock.json,target=package-lock.json \
  --mount=type=cache,target=/root/.npm \
  npm ci --include=dev
USER node
COPY . .
CMD ["npm","run","dev"]

FROM base as prod
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    sh -c 'if [ -f package-lock.json ]; then npm ci --include=dev; else npm install --include=dev; fi'

USER node
COPY . .
CMD ["node","start"]