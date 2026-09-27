FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN chmod +x Qwen3.5-0.8B-Q8_0.llamafile

ENV NODE_ENV=production
ENV LLAMAFILE_URL=http://127.0.0.1:8080/v1/chat/completions

RUN npm run build

CMD ["sh", "-c", "./Qwen3.5-0.8B-Q8_0.llamafile --server --port 8080 & exec npm start -- -H 0.0.0.0 -p ${PORT:-3000}"]