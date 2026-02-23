#!/bin/bash
EXEC=$(which docker-compose)
if [ $? -eq 0 ]; then
	echo "docker-compose classic"
else
	echo "docker compose v2"
	EXEC="docker compose"
fi

$EXEC up -d --build

if [ $? -ne 0 ]; then
	echo "Assegura't que has instal·lat docker i docker-compose (o docker-compose-v2)"
	exit 1
fi
