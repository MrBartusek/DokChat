# DokChat

DokChat is fully fledged instant messaging application. It supports users authentication, groups, attachment, GIFs, emojis.
Frontend is made with React and Typescript. Backend runs on Express, Typescript and Postgres. Live communication is made with Socket.io.
Whole thing is hosted on AWS (EC2, S3, SES).

## Database Design

Database design is loosely based on [yoosuf/Messenger](https://github.com/yoosuf/Messenger). You can see the
visualization on [DB Desinger](https://dbdesigner.page.link/E5jWkh17kMUprBzP6) or directly in
[db/initalize.ts](./src/server/db/initalize.ts).

## Features

[x] User authentication with JWT refresh and access tokens
[x] Users identity handled by usernames, tags and snowflakes. Something like Discord
[x] Instant Messaging
[ ] Gif Support
[ ] Emoji Support
[ ] Attachments