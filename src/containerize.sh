#/usr/bin/env bash

# create a file called blog-app.log that is readable and writable by everyone only if it does not exist
if [ ! -f blog-app.log ]; then
    touch blog-app.log
    chmod 666 blog-app.log
fi

# start containers via docker compose
docker compose up -d
