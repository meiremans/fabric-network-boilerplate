#!/usr/bin/env bash
docker images --no-trunc --all --quiet --filter="dangling=true" | grep "dev-" | awk '{print $3}' | xargs --no-run-if-empty docker rmi -f