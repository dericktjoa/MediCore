FROM node:20-bookworm-slim AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

ARG REACT_APP_API_URL=

RUN npm run build

FROM node:20-bookworm-slim AS app

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./backend/
RUN npm ci --omit=dev --prefix ./backend

COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/build ./frontend/build

EXPOSE 5000

WORKDIR /app/backend
CMD ["node", "server.js"]
