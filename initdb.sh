#!/bin/bash

SCRIPT_DIR="$(dirname "$0")"
docker compose exec -T db mysql -u exampleuser -pexamplepass < $SCRIPT_DIR/sqlscripts/init-db.sql
