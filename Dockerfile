# Install dependencies only when needed
FROM node:19-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# install dependencies
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN npx pnpm i --no-frozen-lockfile

# Rebuild the source code only when needed
FROM node:19 AS builder
WORKDIR /usr/src/app
COPY . .
COPY --from=deps /usr/src/app/node_modules ./node_modules
RUN npx pnpm run build

# Production image, copy all the files and run next
FROM node:19-alpine AS runner
WORKDIR /usr/src/app

ARG SYTHE_USER
ARG SYTHE_PASS
ARG SYTHE_THREAD
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY

ENV SYTHE_USER $SYTHE_USER
ENV SYTHE_PASS $SYTHE_PASS
ENV SYTHE_THREAD $SYTHE_THREAD
ENV SUPABASE_URL $SUPABASE_URL
ENV SUPABASE_ANON_KEY $SUPABASE_ANON_KEY

RUN adduser -S torwent -D -u 10000 -s /bin/nologin
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/.env ./.env

USER 10000
EXPOSE 8080
CMD ["node", "./build"]