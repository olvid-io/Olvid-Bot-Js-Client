# **Olvid Bot Js Client** #

## Introduction
Welcome to the Olvid Js Client repository, part of the Olvid bots framework.
If you're new here, consider starting with our [Documentation](https://doc.bot.olvid.io).

This repository contains source code for two npm packages:
- [@olvid/bot-node](https://www.npmjs.com/package/@olvid/bot-node)
- [@olvid/bot-web](https://www.npmjs.com/package/@olvid/bot-web)

## Overview
Both module implements our Olvid daemon gRPC api described in *./protobuf*.

## Install
To run and compile both module use these commands.
```shell
git clone https://github.com/olvid-io/Olvid-Bot-Js-Client olvid-js
cd olvid-js
git submodule init && git submodule update

npm install
npm run generate
npm run build
```

To compile only one package go to `./node` or `./web` and run the same commands.
```shell
npm install
npm run generate
npm run build
```
