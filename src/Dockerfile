####################
# build stage
####################

FROM node:21.7-alpine3.19@sha256:6d0f18a1c67dc218c4af50c21256616286a53c09e500fadf025b6d342e1c90ae AS builder

# set app directory
ARG APP_DIR=/usr/src/app

RUN mkdir -p ${APP_DIR}

WORKDIR ${APP_DIR}

# install dependencies
COPY --chown=node:node package* ./
RUN npm i -g typescript && npm ci

# copy code into container as 'node' user
COPY --chown=node:node . ${APP_DIR}

# transpile ts to js
RUN  npm run compile




##############################
# runtime stage - final image
##############################

FROM node:21.7-alpine3.19@sha256:6d0f18a1c67dc218c4af50c21256616286a53c09e500fadf025b6d342e1c90ae

LABEL author="winterrdog"
LABEL description="A blog REST api exercise from The Odin Project"

# set app & logs directories
ARG APP_DIR=/usr/src/app
ARG LOGS_DIR=/var/log
ARG LOGS_FILE=${LOGS_DIR}/blog-app.log

# set up locations for logs and app
RUN mkdir -p ${LOGS_DIR} && \
    mkdir -p ${APP_DIR} && \
    touch ${LOGS_FILE} && \
    chmod 644 ${LOGS_FILE} && \
    chown node:node ${LOGS_FILE}

WORKDIR ${APP_DIR}

# copy transpiled code from build stage
COPY --from=builder ${APP_DIR}/dist ./dist
COPY --from=builder ${APP_DIR}/node_modules ./node_modules

EXPOSE 3000

# set non-root user
USER node

# entry point
ENTRYPOINT [ "node", "./dist/bin/www.js" ]
