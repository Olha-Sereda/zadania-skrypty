FROM openresty/openresty:alpine-fat

RUN apk add --no-cache \
      postgresql-client \
      postgresql-dev \
      perl \
      git \
      curl \
      ca-certificates \
      openssl-dev \
      build-base

RUN luarocks install lapis \
 && luarocks install lapis-console \
 && luarocks install lua-cjson \
 && luarocks install pgmoon \
 && luarocks install moonscript \
 && luarocks install busted \
 && luarocks install luasocket \
 && luarocks install lua-resty-http

WORKDIR /app

EXPOSE 8080

CMD ["sh", "-c", "mkdir -p logs static/uploads && exec lapis server ${LAPIS_ENVIRONMENT:-development}"]
