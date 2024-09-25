####################
#   BUILD STAGE
####################

FROM node:latest as builder

# set app directory
ARG APP_DIR=/usr/src/app

RUN mkdir -p ${APP_DIR}

WORKDIR ${APP_DIR}

# install dependencies
COPY --chown=node:node package* ./

RUN npm i -g typescript && \
    npm ci --include=dev

# copy code into container as 'node' user
COPY --chown=node:node . ${APP_DIR}

# transpile ts to js
RUN  npm run compile

# remove dev dependencies, install only production dependencies and clean cache
RUN rm -rf node_modules && \
    npm ci --omit=dev && \
    npm cache clean --force




##############################
#   PRODUCTION STAGE
##############################

FROM node:22.7.0-alpine3.20@sha256:ed9736a13b88ba55cbc08c75c9edac8ae7f72840482e40324670b299336680c1

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

# set non-root user
USER node

EXPOSE 3000

ENTRYPOINT [ "node", "./dist/bin/www.js" ]
