#!/bin/bash
set -e

# Start Redis in the background
redis-server --daemonize yes

# Start Rails server
exec "$@"
