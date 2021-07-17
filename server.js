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

    // fetch user profile with uid
    app.get('/profile/:uid', (req, res) => {
        const uid = req.params.uid;
        api.getProfileWithUid(uid).then(response => res.send(response));
    });

    // fetch user's albums list
    app.post('/dashboard', (req, res) => {
        const token = req.body.token;
        api.getAllAlbumsWithAuth(token).then(response => res.send(response));
    });

    // fetch album data without children
    app.get('/album/:aid', (req, res) => {
        const aid = req.params.aid;
        const album = {
            aid: aid,
            title: "This is a fake album.",
            cover: "fake cover url",
            size: "55",
            createtime: "aabbcc",
            intro: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            uid: "1",
            username: "first fake user"
        };
        res.send(album);
    });

    // fetch users list
    app.post('/users', (req, res) => {
        const token = req.body.token;
        api.getAllUsersWithAuth(token).then(response => res.send(response));
    });

    app.listen(port, () => console.log('API is running at port ' + port));
};


const mongodbPort = 27017;
const { response } = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { useReducer } = require('react/cjs/react.production.min');
const url = "mongodb://localhost:" + mongodbPort;


async function login(credentials) {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db('memento');
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
    const db = client.db('memento');
    const collectionUsers = db.collection('users');
    const user = {
        email: userInfo.email,
        password: userInfo.password,
        name: userInfo.name,
        role: 10
    };
    const profile = {
        gender: userInfo.gender,
        age: userInfo.age,
        createtime: getFormattedTime()
    };
    const response = {};
    try {
        const insertResult = await collectionUsers.insertOne(user);
        profile._id = insertResult.insertedId;
        const collectionProfiles = await collectionProfiles.insertOne(profile);
        response.success = true;
        response.data = {
            token: {
                uid: insertResult.insertedId.toHexString(),
                email: userInfo.email,
                password: userInfo.password,
                role: 10
            },
            username: userInfo.name
        };
    } catch (e) {
        response.success = false;
        response.error = e;
        console.log(e + "[signup]");
    }
    client.close();
    return response;
}

async function getProfileWithUid(uid) {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db('memento');
    const collectionProfiles = db.collection('profiles');
    const formattedId = new ObjectId(uid);
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
    const db = client.db('memento');
    const collectionAlbums = db.collection('albums');
    const credentials = {
        email: token.email,
        password: token.password
    }
    const user = await collectionAlbums.findOne(credentials);
    const response = {};
    if (user) {
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
        console.error("Authentication failed");
    }
    client.close();
    return response;
}

async function getAllUsersWithAuth(token) {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db('memento');
    const collectionUsers = db.collection('users');
    const credentials = {
        email: token.email,
        password: token.password
    }
    const result = await collectionUsers.findOne(credentials);
    const response = {};
    if (result && result.role <= 1) {
        const allUsers = await collectionUsers.find({}, {password: 0, role: 0}).toArray();
        allUsers.forEach((user) => {
            user.uid = user._id.toHexString();
            delete user._id;
        });
        response.success = true;
        response.data = allUsers;
    } else {
        response.success = false,
        response.error = "You do not have the access";
    }
    client.close();
    return response;
}


const mongodbAPI = {
    login: login,  // {email: xxx, password: xxx}
    signup: signup,  // {email: xxx, password: xxx, gender: xxx, age: xxx}
    getAllAlbumsWithAuth: getAllAlbumsWithAuth,  // {uid: xxx}
    getAllUsersWithAuth: getAllUsersWithAuth,  // token
    getProfileWithUid: getProfileWithUid  // uid
};

serverStart(8080, mongodbAPI);