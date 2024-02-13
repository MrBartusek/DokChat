# DokChat | [Live Demo](https://dokchat.dokurno.dev)

![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/MrBartusek/DokChat/ci.yaml) [![Website](https://img.shields.io/website?url=https%3A%2F%2Fdokchat.dokurno.dev&link=https%3A%2F%2Fdokchat.dokurno.dev)](https://dokchat.dokurno.dev)
[![Docker Image Version (tag latest semver)](https://img.shields.io/docker/v/mrbartusek/dokchat/latest?label=docker%20version&link=https%3A%2F%2Fhub.docker.com%2Frepository%2Fdocker%2Fmrbartusek%2Fdokchat)](https://hub.docker.com/repository/docker/mrbartusek/dokchat/general) ![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fupdate.electronjs.org%2FMrBartusek%2FDokChat%2Fwin32-x64%2F0.0.0&query=%24.name&label=desktop+version&color=blue)

[![hero](https://i.imgur.com/FUHitdG.png)](https://dokchat.dokurno.dev)

DokChat is complete, fully fledged instant messaging application. It has everything
you need: groups, attachment, GIFs, emojis, customization and desktop app.

## Quick Start

If you want to start using DokChat, I host fully fledged [live demo](https://dokchat.dokurno.dev). For simplicity sake you can also create [a demo account](https://dokchat.dokurno.dev/demo) and skip registration process.

## Features

- Groups for multiple participants as well as private conversations between two people.
- Custom authentication system based on [JWT Tokens](https://jwt.io) and discord-like user tags `MrBartusek#0001`
- Social authentication with Google and Facebook.
- Two-Factor Authentication with QR codes that works with all major authenticator apps.
- Instant messaging with [socket.io](https://socket.io).
- Username, tag and avatar customization as well as user preferences.
- Chat color, name and avatar customization.
- Link-based group invites.
- Blocking or hiding other users.
- GIFs ([gif-picker-react](https://github.com/MrBartusek/gif-picker-react)), Emojis ([Twemoji](https://twemoji.twitter.com)), videos, images and Markdown support for messages.
- Current online status with green dots.
- reCAPTCHA and ratelimit protections against bots.
- Fully functional [Electron Desktop App](https://dokchat.dokurno.dev/download) with browser login handoff.

## Deploy own DokChat instance

DokChat is an extensive project that uses a multitude of tools and cloud services. It's also well suited to be deployed on your own. We have configured multiple tools such as
[Terraform](https://www.terraform.io), [Docker](https://www.docker.com) and
[NGINX](https://nginx.org) so you can easily deploy your own DokChat server and infrastructure.

[See `SETUP.md` for detailed setup guide.](SETUP.md)

## Tech Stack

- **PostgreSQL** - Postgress is used as database without any ORM. You can see database visualization in [Database Design](#database-design) section.
- **Express** - Node.js express is used as primary backend framework
- **React** - React.js alongside with react-bootstrap and other client-side libraries is used as frontend library.
- **Typescript** - Typescript is used both on backend and frontend code to ensure type safety in whole project.
- **Socket.io** - Websockets are used for instant communication
- **Amazon AWS**- AWS is used as the primary hosting provider, handling server and attachments hosting, as well as emails.
- **Terraform** - Whole infrastructure is provisioned using Terraform

### Hosting

This project is designed to run on AWS using following services:

- **[EC2](https://aws.amazon.com/ec2/)** - for hosting server
- **[S3](https://aws.amazon.com/s3/)** - for attachments and profile pictures
- **[SES](https://aws.amazon.com/ses/)** - for email sending
- **[SQS](https://aws.amazon.com/sqs/)**, **[SNS](https://aws.amazon.com/sns/)** - for email bounces and complaints
- **[IAM](https://aws.amazon.com/iam/)**, for access management

## Database Design

Database design is loosely based on [yoosuf/Messenger](https://github.com/yoosuf/Messenger).
It features full user authentication and support for group chats. You can see the
visualization on [DB Designer](https://dbdesigner.page.link/8WTzU9jzrGC1imjK8) or directly in
[server/db/structure.ts](./src/server/db/structure.ts)

[![db design](https://i.imgur.com/UP4E7Hl.png)](https://dbdesigner.page.link/8WTzU9jzrGC1imjK8)

## API

DokChat uses Rest API and Websocket API for communication, both are authenticated using JWT tokens.
You can check internal API structure in Postman or directly in [server/routes](./src/server/routes/)

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/7055992-e37dd316-dc47-4469-b9ed-bd99de585463?action=collection%2Ffork&collection-url=entityId%3D7055992-e37dd316-dc47-4469-b9ed-bd99de585463%26entityType%3Dcollection%26workspaceId%3D0c2f10b6-52a7-49d2-aed2-84f4890c693b#?env%5BSimple%5D=W3sia2V5IjoiYXBpLWRvbWFpbiIsInZhbHVlIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FwaS8iLCJlbmFibGVkIjp0cnVlLCJ0eXBlIjoiZGVmYXVsdCJ9LHsia2V5IjoidG9rZW4iLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWUsInR5cGUiOiJkZWZhdWx0In1d)

## Contributing

Want to contribute to the project?

First of all, thanks! If you find and problems with the project or want to suggest a feature
don't hesitate to create [an issue](https://github.com/MrBartusek/DokChat/issues). If you want
to contribute code changes please check [`SETUP.md`](SETUP.md) for detailed setup guide. We
accept code changes via [Pull Requests](https://github.com/MrBartusek/DokChat/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc).
