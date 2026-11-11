# Build from the repository root: docker build -f apps/sandbox/Dockerfile .
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo

# Install dependencies first, so this step is cached until a package.json changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/sandbox/package.json apps/sandbox/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --filter sandbox...

COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/sandbox apps/sandbox
RUN pnpm --filter sandbox build
# The built server with only its production dependencies: the pinned libraries
# mini-apps may load (src/routes.ts serves them from node_modules).
RUN pnpm --filter sandbox deploy --prod --legacy /out

FROM node:22-alpine
# production keeps the files in memory after the first read (src/respond.ts)
ENV NODE_ENV=production HOST=0.0.0.0 SANDBOX_PORT=3200
WORKDIR /app
COPY --from=build /out/package.json ./
COPY --from=build /out/node_modules node_modules
COPY --from=build /repo/apps/sandbox/dist dist
USER node
EXPOSE 3200
CMD ["node", "dist/server.js"]
