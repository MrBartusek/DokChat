# DokChat | [Website](https://dokchat.dokurno.dev)

[![hero](https://i.imgur.com/FT5WBjf.png)](https://dokchat.dokurno.dev)

DokChat is fully fledged instant messaging application. It supports all of the common chatting features like groups, attachment, GIFs and emojis.

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

## Tech Stack

This project uses **PERN** tech stack.

- [![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=fff)](https://postgresql.org)
- [![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=express&logoColor=fff)](https://expressjs.com)
- [![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=333)](https://reactjs.org)
- [![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=fff)](https://nodejs.org)
- [![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=fff)](https://typescriptlang.org)
- [![Socket.io](https://img.shields.io/badge/-Socket.io-010101?style=flat-square&logo=socketdotio&logoColor=fff)](https://socket.io)
- [![Amazon AWS](https://img.shields.io/badge/-Amazon_AWS-232F3E?style=flat-square&logo=amazonaws&logoColor=fff)](https://aws.amazon.com/)
  
### Hosting

This project is designed to run on AWS.

- [EC2](https://aws.amazon.com/ec2/) - for hosting server
- [S3](https://aws.amazon.com/s3/) - for attachments and profile pictures
- [SES](https://aws.amazon.com/ses/) - for email sending
- [SQS](https://aws.amazon.com/sqs/), [SNS](https://aws.amazon.com/sns/) - for email bounces and complaints handling

## Database Design

Database design is loosely based on [yoosuf/Messenger](https://github.com/yoosuf/Messenger). You can see the
visualization on [DB Desinger](https://dbdesigner.page.link/E5jWkh17kMUprBzP6) or directly in
[server/db/initalize.ts](./src/server/db/initalize.ts).

## API

You can check internal API structure in Postman or directly in [server/routes](./src/server/routes/)

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/7055992-e37dd316-dc47-4469-b9ed-bd99de585463?action=collection%2Ffork&collection-url=entityId%3D7055992-e37dd316-dc47-4469-b9ed-bd99de585463%26entityType%3Dcollection%26workspaceId%3D0c2f10b6-52a7-49d2-aed2-84f4890c693b#?env%5BSimple%5D=W3sia2V5IjoiYXBpLWRvbWFpbiIsInZhbHVlIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FwaS8iLCJlbmFibGVkIjp0cnVlLCJ0eXBlIjoiZGVmYXVsdCJ9LHsia2V5IjoidG9rZW4iLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWUsInR5cGUiOiJkZWZhdWx0In1d)
