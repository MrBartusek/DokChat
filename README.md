# DokChat | [Website](https://dokchat.dokurno.dev)

[![hero](https://i.imgur.com/ZapD7Mn.png)](https://dokchat.dokurno.dev)

DokChat is complete, fully fledged instant messaging application. It supports all of the common chatting features like groups, attachment, GIFs and emojis.

## Features

- Groups for multiple participants as well as private conversations between two people
- Custom authentication system based on [JWT Token](https://jwt.io) and discord-like user tags `MrBartusek#0001`
- Social authentication with Google and Facebook
- Instant messaging with [socket.io](https://socket.io)
- Username, tag and avatar customization as well as user preferences
- Chat color, name and avatar customization
- Link-based group invites
- Blocking or hiding other users
- GIFs ([gif-picker-react](https://github.com/MrBartusek/gif-picker-react)), Emojis ([Twemoji](https://twemoji.twitter.com)), videos, images and Markdown support for messages
- Current online status with green dots
- reCAPTCHA and ratelimit protections against bots.

## Local Setup

See [`SETUP.MD`](SETUP.md) for local setup guide.

## Tech Stack

- **PostgreSQL** - Postgress is used as database without any ORM. You can see database visualization in [Database Design](#database-design) section.
- **Express** - Node.js express is used as primary backend framework
- **React** - React.js alongside with react-bootstrap and other client-side libraries is used as frontend libiary.
- **Typescript** - Typescript is used both on backend and frontend code to ensure type safety in whole project.
- **Socket.io** - Websockets are used for instant communication
- **Amazon AWS**- AWS is used as primary hosting provider that handles server and attachments hosting as well as emails.
  
### Hosting

This project is designed to run on AWS using following services:

- [EC2](https://aws.amazon.com/ec2/) - for hosting server
- [S3](https://aws.amazon.com/s3/) - for attachments and profile pictures
- [SES](https://aws.amazon.com/ses/) - for email sending
- [SQS](https://aws.amazon.com/sqs/), [SNS](https://aws.amazon.com/sns/) - for email bounces and complaints handling

## Database Design

Database design is loosely based on [yoosuf/Messenger](https://github.com/yoosuf/Messenger). It features full user authentication and support for group chats. You can see the
visualization on [DB Desinger](https://dbdesigner.page.link/8WTzU9jzrGC1imjK8) or directly in
[server/db/initalize.ts](./src/server/db/initalize.ts).

[![db desing](https://i.imgur.com/psinkRD.png)](https://dbdesigner.page.link/8WTzU9jzrGC1imjK8)

## API

DokChat uses Rest API and Websocket API for communication, both are authenticated using JWT tokens. You can check internal API structure in Postman or directly in [server/routes](./src/server/routes/)

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/7055992-e37dd316-dc47-4469-b9ed-bd99de585463?action=collection%2Ffork&collection-url=entityId%3D7055992-e37dd316-dc47-4469-b9ed-bd99de585463%26entityType%3Dcollection%26workspaceId%3D0c2f10b6-52a7-49d2-aed2-84f4890c693b#?env%5BSimple%5D=W3sia2V5IjoiYXBpLWRvbWFpbiIsInZhbHVlIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FwaS8iLCJlbmFibGVkIjp0cnVlLCJ0eXBlIjoiZGVmYXVsdCJ9LHsia2V5IjoidG9rZW4iLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWUsInR5cGUiOiJkZWZhdWx0In1d)
