# @olvid/bot-web #

## Introduction
This repository is part of the Olvid bots framework.
If you're new here, consider starting with our [Documentation](https://doc.bot.olvid.io).

This module allows you to connect with an Olvid daemon and create bots in your browser.

⚠️ You will need a [gRPC web proxy](https://hub.docker.com/r/olvid/grpc-web-proxy) to connect to a daemon with *@olvid/bot-web*. We packaged a docker image that you can run next to your daemon.

⚠️ This library does not support client streaming RPC. This means currently you cannot send attachments or set photo with this library. 
This is due to browser limitations when used with gRPC.

## Installation

```bash
npm install @olvid/bot-web
```

## Usage
Follow our [🌐 Web Browser](https://doc.bot.olvid.io/web) guide to set up your Olvid daemon instance.
