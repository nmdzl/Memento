# Memento - Free Video Album

Enjoy building your Own Video Album!

## Overview

This is a full stack individual project. The repository is not yet ready for production.

Major functions of the application include building your own albums which include a list of video or music resources (redirecting to the providers) and exploring resources from a variety of providers.

## Installation

You must have Node.JS and React.JS installed in your system to run this web application.

## Front-end Compilation

1. Navigate to the project directory *.../memento*.
2. Run `npm install`.
3. Run `npm start-frontend`. (**Notice**: Run `npm start` will deploy the frontend and start the server communicating with MongoDB Atlas in parallel.)
4. You can access the app application on *localhost:3000*.

## Server

### How to Setup Server

You can setup the server either to communicate with local database, or to communicate with MongoDB Atlas.

It is recommended to setup server communicating with MongoDB Atlas because you won't lose your progress!

If you would like to setup local server, remember to start the local database system service.

Note that the front-end is set to communicate through port 8080. You can only have one server actively listening at port 8080 at one time.

#### Local Database

1. Navigate to the project directory *.../memento*.
2. Run `node server.js`

#### MongoDB Atlas Database

1. Navigate to the project directory *.../memento*.
2. Run `node server/server.js`

## Database

MongoDB Database Management System is engaged.

Two database options are provided - local database (fake database) and MongoDB Atlas database (real database). They share the same schema and initial fake data.

After initialization, the database includes 4 collections: `users`, `profiles`, `albums`, `album.contents`. Check `db-init.js` for the details of schemas.

### Initial Accounts

#### admin account

email: admin@memento.io

password: 11111111

#### user account

email: user@memento.io

password: 22222222

### How to Setup Local Database

Following steps are based on Windows 10 x64.

1. Install MongoDB.
2. Start *mongodb* process by `mongod --dbpath=/data`.
3. Navigate to the project directory *.../memento*.
4. Run `node db-init.js` to automatically drop the existing database and re-initialize the fake database.

## Future work

1. Integrate third part account authentication like Google, Facebook, etc.
2. Finish CRUD on *album.contents* database.
3. Generalize the video types to other websites like *bilibili.com*, *netflix.com*, *itunes.com*, etc.
4. Design the Main page and Explore page.
5. Embed player.
6. Enforce encryption of *token* between host and server.
7. Deploy the server.
8. Embed advertisement.
