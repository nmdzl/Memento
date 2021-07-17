const dbName = 'memento';
const serverPort = 8080;


const getFormattedTime = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    const convertedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return convertedDate.toISOString().split('T')[0];
}

const serverStart = function (port, api) {
    const express = require('express');
    const cors = require('cors');
    const app = express();

    app.use(express.json());
    app.use(cors());

    // user log in
    app.post('/login', async (req, res) => {
        api.login(req.body).then(response => res.send(response));
    });

    // user sign up
    app.post('/signup', (req, res) => {
        api.signup(req.body).then(response => res.send(response));
    });

    // fetch user profile by uid
    app.get('/profile/:uid', (req, res) => {
        const uid = req.params.uid;
        api.getProfileByUid(uid).then(response => res.send(response));
    });

    // fetch the user's albums list with authentication
    app.post('/dashboard', (req, res) => {
        api.getAllAlbumsWithAuth(req.body).then(response => res.send(response));
    });

    // fetch album data without children by aid
    app.get('/album/:aid', (req, res) => {
        const aid = req.params.aid;
        api.getAlbumByAid(aid).then(response => res.send(response));
    });

    // fetch users list
    app.post('/users', (req, res) => {
        const token = req.body.token;
        api.getAllUsersWithAuth(token).then(response => res.send(response));
    });

    app.listen(port, () => console.log('API is running at port ' + port));
};


const mongodbPort = 27017;
const { MongoClient, ObjectId } = require('mongodb');
const url = "mongodb://localhost:" + mongodbPort;


async function login(credentials) {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionUsers = db.collection('users');
    const user = await collectionUsers.findOne(credentials);
    const response = {};
    if (user) {
        response.success = true;
        response.data = {
            token: {
                uid: user._id.toHexString(),
                email: user.email,
                password: user.password,
                role: user.role
            },
            username: user.name
        };
    } else {
        response.success = false;
        response.error = 'Authentication failed';
        console.error('Authentication failed');
    }
    client.close();
    return response;
}

async function signup(userInfo) {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionUsers = db.collection('users');
    const user = {
        email: userInfo.email,
        password: userInfo.password,
        name: userInfo.name,
        role: 10
    };
    const profile = {
        name: userInfo.name,
        gender: userInfo.gender,
        age: userInfo.age,
        createtime: getFormattedTime()
    };
    const response = {};
    try {
        const insertedUser = await collectionUsers.insertOne(user);
        profile._id = insertedUser.insertedId;
        const collectionProfiles = db.collection('profiles');
        await collectionProfiles.insertOne(profile);
        response.success = true;
        response.data = {
            token: {
                uid: insertedUser.insertedId.toHexString(),
                email: userInfo.email,
                password: userInfo.password,
                role: 10
            },
            username: userInfo.name
        };
    } catch (e) {
        response.success = false;
        response.error = e;
        console.error(e + "[signup]");
    }
    client.close();
    return response;
}

async function getProfileByUid(uid) {
    var formattedId;
    try {
        formattedId = new ObjectId(uid);
    } catch (e) {
        console.error(e + '[fetch profile with uid]');
        return {
            success: false,
            error: e
        };
    }
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionProfiles = db.collection('profiles');
    const profile = await collectionProfiles.findOne({ _id: formattedId });
    const response = {};
    if (profile) {
        response.success = true;
        profile.uid = profile._id.toHexString();
        delete profile._id;
        response.data = profile;
    } else {
        response.success = false;
        response.error = 'Profile not found (uid=' + uid + ')';
        console.error('Profile not found (uid=' + uid + ')');
    }
    client.close();
    return response;
}

async function getAllAlbumsWithAuth(token) {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionUsers = db.collection('users');
    const credentials = {
        email: token.email,
        password: token.password
    }
    const user = await collectionUsers.findOne(credentials);
    const response = {};
    if (user) {
        const collectionAlbums = db.collection('albums');
        const allAlbums = await collectionAlbums.find({uid: user._id}).toArray();
        allAlbums.forEach((album) => {
            album.aid = album._id.toHexString();
            delete album._id;
        });
        response.success = true;
        response.data = allAlbums;
    } else {
        response.success = false,
        response.error = "Authentication failed";
        console.error("Authentication failed[get album list]");
    }
    client.close();
    return response;
}

async function getAllUsersWithAuth(token) {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionUsers = db.collection('users');
    const credentials = {
        email: token.email,
        password: token.password
    }
    const user = await collectionUsers.findOne(credentials);
    const response = {};
    if (user && user.role <= 5) {
        const allUsers = await collectionUsers.find({ role: { $gt: user.role} }, {password: 0, role: 0}).toArray();
        allUsers.forEach((_user) => {
            _user.uid = _user._id.toHexString();
            delete _user._id;
        });
        response.success = true;
        response.data = allUsers;
    } else {
        response.success = false,
        response.error = "You do not have the access right";
        console.error('You do not have the access right[get user list]')
    }
    client.close();
    return response;
}

async function getAlbumByAid(aid) {
    var formattedId;
    try {
        formattedId = new ObjectId(aid);
    } catch (e) {
        console.error('Album not found (aid=' + aid + ')');
        return {
            success: false,
            error: e
        };
    }
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionAlbums = db.collection('albums');
    const album = await collectionAlbums.findOne({ _id: formattedId });
    const response = {};
    if (album) {
        const collectionUsers = db.collection('users');
        const author = await collectionUsers.findOne({ _id: album.uid });
        response.success = true;
        album.aid = album._id.toHexString();
        delete album._id;
        album.username = author.name;
        response.data = album;
    } else {
        response.success = false;
        response.error = 'Album not found (aid=' + aid + ')';
        console.error('Album not found (aid=' + aid + ')');
    }
    client.close();
    return response;
}


const mongodbAPI = {
    login: login,  // {email: xxx, password: xxx}
    signup: signup,  // {email: xxx, password: xxx, gender: xxx, age: xxx}
    getAllAlbumsWithAuth: getAllAlbumsWithAuth,  // {uid: xxx}
    getAllUsersWithAuth: getAllUsersWithAuth,  // token
    getProfileByUid: getProfileByUid,  // uid
    getAlbumByAid: getAlbumByAid  // aid
};

serverStart(serverPort, mongodbAPI);