# Raspberry pi - Temperature
This guide will help you set up a raspberry pi to share temperature information with `gydam`.

## Pre-requisites
> This guide will only work with a `ds18b20` sensor.

Enable `1-Wire` protocol in your raspberry pi.
1. `sudo raspi-config`
2. Head on over to `Interfacing Options`
3. Enable `1-Wire`
4. Reboot the Raspberry.

## Installation
> Note that every step from now on need to be executed in a Raspberry Pi.

### Install Node.js with nvm
1. Install nvm.
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```
2. Load nvm.
```
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```
3. Install Node.js
```
nvm install 12
```
4. Activate Node.js
```
nvm use 12
```

### Install this project and its peer dependencies
1. Download gydam-agent and gydam-utils.
```
mkdir ~/gydam && cd ~/gydam
git init
git sparse-checkout init --cone
git sparse-checkout set gydam-agent gydam-utils
```
2. Set everything up.
```
cd ~/gydam/gydam-agent && npm install
cd ~/gydam/gydam-utils && npm install
```
3. Move temperature project to root.
```
mv ~/gydam/gydam-agent/examples/raspberry-temperature ~/temperature
```
4. Install dependencies.
```
cd ~/temperature
npm install
```
5. Rename `.env.example` to `.env`.
```
mv .env.example .env
```
6. Set `.env` variables.

## Usage
Once you've done everything in this guide, you can start the program by simply running:
```
# Inside ~/temperature
npm start
```

You can use `gydam-cli` to see the data.
