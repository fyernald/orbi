# Build from the repository root: docker build -f apps/server/Dockerfile .
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo

# Install dependencies first, so this step is cached until a package.json changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/
COPY packages/core/package.json packages/core/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --filter server...

COPY tsconfig.base.json ./
COPY packages packages
COPY apps/server apps/server
RUN pnpm --filter server build
# Copy the built server with only its production dependencies to /out.
RUN pnpm --filter server deploy --prod --legacy /out

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out/package.json ./
COPY --from=build /out/node_modules node_modules
COPY --from=build /repo/apps/server/dist dist
USER node
EXPOSE 3001
CMD ["node", "dist/index.js"]
