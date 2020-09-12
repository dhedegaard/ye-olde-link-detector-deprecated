FROM hayd/deno:alpine-1.3.3

WORKDIR /app

COPY ./src/deps.ts ./src/deps.ts
RUN deno cache ./src/deps.ts

COPY . .
RUN deno cache ./main.ts && \
  deno test && \
  deno lint --unstable

CMD ["deno", "run", "--allow-net", "--allow-env", "./main.ts"]
