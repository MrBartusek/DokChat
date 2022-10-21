# DokChat

DokChat is fully fledged instant messaging application. It supports users authentication, groups, attachment, GIFs, emojis.
Frontend is made with React and Typescript. Backend runs on Express, Typescript and Postgres. Live communication is made with Socket.io.
Whole thing is hosted on AWS (EC2, S3, SES).

## Database Design

Database design is loosely based on [yoosuf/Messenger](https://github.com/yoosuf/Messenger). You can see the
visualization on [DB Desinger](https://dbdesigner.page.link/E5jWkh17kMUprBzP6) or directly in
[server/db/initalize.ts](./src/server/db/initalize.ts).

## API

You can check internal API structure in Postman or directly in [server/routes](./src/server/routes/)

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/7055992-e37dd316-dc47-4469-b9ed-bd99de585463?action=collection%2Ffork&collection-url=entityId%3D7055992-e37dd316-dc47-4469-b9ed-bd99de585463%26entityType%3Dcollection%26workspaceId%3D0c2f10b6-52a7-49d2-aed2-84f4890c693b#?env%5BSimple%5D=W3sia2V5IjoiYXBpLWRvbWFpbiIsInZhbHVlIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FwaS8iLCJlbmFibGVkIjp0cnVlLCJ0eXBlIjoiZGVmYXVsdCJ9LHsia2V5IjoidG9rZW4iLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWUsInR5cGUiOiJkZWZhdWx0In1d)

## Features

- [x] User authentication with JWT refresh and access tokens
- [x] Users identity handled by usernames, tags and snowflakes. Something like Discord
- [x] Instant Messaging
- [ ] Gif Support
- [ ] Emoji Support
- [ ] Attachments