# Local Setup

This is extensive guide how to run your own DokChat instance. 

## Prerequisites

- Latest [GIT](https://git-scm.com)
- Latest LTS [Node.js](https://nodejs.org/en)
- Latest [PostgresSQL](https://www.postgresql.org) database with default credentials
- Latest Stabile  [Redis](https://redis.io)
- [AWS](https://aws.amazon.com) account with configured services:
    - Any EC2 Instance (DokChat currently use `t2.micro`) with Amazon Linux
    - One S3 Bucket for attachments
    - If you want to handle email bounces out of SES Sandbox, SQS Queues for Bounces and Complaints
    - 4 SES E-Mail Templates, JSON files for `aws ses create-template` command can be found in [src/server/email](./src/server/email)
    - IAM user for DokChat with security policy:
        - SQS: `ReceiveMessage`, `DeleteMessage`
        - S3: `GetObject`, `DeleteObject`, `PutObject`
        - SES: `SendEmail`, `SendRawEmail`, `SendTemplatedEmail`
    - SES identity *(You don't need to leave sandbox if, you just want to check out how DokChat works)*
- Google and Facebook `CLIENT_ID` for Social Login
- Google V2 Invisible reCAPTCHA `SITE_KEY` and `SECRET`
- Google Cloud [Tenor V2 API](https://console.cloud.google.com/marketplace/product/google/tenor.googleapis.com) Token

## Using Docker
1. Clone this repository
1. Copy and rename `.example.env` file to `.env` and fill it with AWS, Facebook, Google and reCAPTCHA tokens
1. Update client-side tokens in [src/client/config.ts](./src/client/config.ts)
1. Install [Docker](https://www.docker.com)
1. run `docker-compose up -d`

## Manual Setup

1. Clone this repository
1. Copy and rename `.example.env` file to `.env` and fill it with AWS, Facebook, Google and reCAPTCHA tokens
1. Update client-side tokens in [src/client/config.ts](./src/client/config.ts)
1. Create postgres database. The default credentials are
    - user: `postgres`
    - password: `postgres`
    - host: `localhost`
    - database: `dokchat`
    - port: `5432`
    - All of these can be altered with environmental variables `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_NAME` and `DB_PORT`
1. Start redis server with `redis-server --save 20 1 --loglevel warning`. The default credentials are
    - host: `localhost`
    - password: `redis`
    - port: `6379`
    - All of these can be altered with environmental variables `REDIS_HOST`, `REDIS_PASS`, `REDIS_PORT`
1. run `npm install`
1. run `npm run build` 
1. run `npm start`
