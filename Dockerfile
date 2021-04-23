FROM hayd/deno:alpine-1.9.1

WORKDIR /app

COPY ./src/deps.ts ./src/deps.ts
RUN deno cache ./src/deps.ts

COPY . .
RUN deno cache ./main.ts && \
  deno test -A && \
  deno lint --unstable

VOLUME ["/app/data"]

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read=.", "--allow-write=.", "./main.ts"]
