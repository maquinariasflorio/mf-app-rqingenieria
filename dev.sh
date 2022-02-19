#!/bin/bash

# Load environment variables
chmod +x env.sh; source ./env.sh

# Npm install if not already
yarn

# Start sass
sass --watch ./src/assets/styles/styles.scss:./src/assets/styles/styles.css &

# Start nuxt
./node_modules/.bin/cross-env ./node_modules/.bin/nuxt
