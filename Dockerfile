FROM hayd/deno:alpine-1.3.3

WORKDIR /app

COPY deps.ts .
RUN deno cache ./deps.ts

COPY . .
RUN deno cache ./main.ts
RUN deno test

CMD ["deno", "run", "--allow-net", "--allow-env", "./main.ts"]
