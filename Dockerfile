FROM hayd/deno:alpine-1.4.0

WORKDIR /app

COPY ./src/deps.ts ./src/deps.ts
RUN deno cache ./src/deps.ts

COPY . .
RUN deno cache ./main.ts && \
  deno test -A && \
  deno lint --unstable

VOLUME ["/app/data"]

CMD ["deno", "run", "--allow-net", "--allow-env", "./main.ts"]
