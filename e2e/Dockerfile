FROM cypress/browsers:node12.14.1-chrome83-ff77

COPY . /workspace

WORKDIR /workspace

RUN yarn install --frozen-lockfile

CMD ./e2e/run.sh