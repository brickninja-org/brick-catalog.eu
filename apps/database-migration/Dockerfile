# syntax=docker/dockerfile:1.22@sha256:4a43a54dd1fedceb30ba47e76cfcf2b47304f4161c0caeac2db1c61804ea3c91

ARG node_version=24.16.0-alpine3.22@sha256:191c9f0080fcbbc6547a85dc0ff7988072214a355aabdc1d2ec55a7dae5eea8a
# renovate: datasource=npm packageName=prisma
ARG prisma_version=7.8.0

FROM node:${node_version}
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 worker

ARG prisma_version
RUN npm i prisma@${prisma_version} && npm cache clean --force

COPY --link --chown=1001:1001 packages/database/prisma ./prisma
COPY --link --chown=1001:1001 packages/database/prisma.config.ts .

USER worker

CMD [ "node_modules/.bin/prisma", "migrate", "deploy" ]
