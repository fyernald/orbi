# Build from the repository root: docker build -f apps/client/Dockerfile .
FROM node:22-alpine AS build
RUN corepack enable
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /repo

# Install dependencies first, so this step is cached until a package.json changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/client/package.json apps/client/
COPY packages/core/package.json packages/core/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --filter client...

COPY tsconfig.base.json ./
COPY packages packages
COPY apps/client apps/client
RUN pnpm --filter client build

FROM node:22-alpine
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
WORKDIR /app
# Next.js "standalone" output is a small server with only the files it needs.
COPY --from=build /repo/apps/client/.next/standalone ./
COPY --from=build /repo/apps/client/.next/static apps/client/.next/static
USER node
EXPOSE 3000
CMD ["node", "apps/client/server.js"]
