#!/bin/bash
if [ "${TRAVIS_EVENT_TYPE}" = "cron" ]; then
  npm i neo4j/graphql#master
fi