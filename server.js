const dbName = 'memento';
const serverPort = 8080;


const getFormattedTimeString = () => {
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
        const data = req.body.data;
        api.login(data).then(response => res.send(response));
    });

    // user sign up
    app.post('/signup', (req, res) => {
        const data = req.body.data;
        api.signup(data).then(response => res.send(response));
    });

    // read user profile by uid
    app.get('/profile/:uid', (req, res) => {
        const uid = req.params.uid;
        api.getProfileByUid(uid).then(response => res.send(response));
    });

    // read the user's albums list
    app.get('/dashboard/:uid', (req, res) => {
        const uid = req.params.uid;
        api.getDashboardByUid(uid).then(response => res.send(response));
    });

    // read album data without children by aid
    app.get('/album/:aid', (req, res) => {
        const aid = req.params.aid;
        api.getAlbumByAid(aid).then(response => res.send(response));
    });

    app.post('/album', (req, res) => {
        const data = req.body.data;
        switch (req.body.type) {
            // create a new album
            case 'create':
                api.createAlbumWithAuth(data).then(response => res.send(response));
                return;
            // update an album with aid
            case 'update':
                api.updateAlbumWithAuth(data).then(response => res.send(response));
                return;
            // delete a list of albums with authentication
            case 'delete':
                api.deleteAlbumsWithAuth(data).then(response => res.send(response));
                return;
        }
    });

    app.post('/user', (req, res) => {
        const data = req.body.data;
        switch (req.body.type) {
            // read users list with authentication
            case 'read':
                api.getAllUsersWithAuth(data).then(response => res.send(response));
                return;
            // delete a list of users with authentication
            case 'delete':
                api.deleteUsersWithAuth(data).then(response => res.send(response));
                return;
        }
    });

    app.listen(port, () => console.log('API is running at port ' + port));
};


const mongodbPort = 27017;
const { MongoClient, ObjectId } = require('mongodb');
const url = "mongodb://localhost:" + mongodbPort;


async function login(data) {
    const credentials = data.credentials;
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionUsers = db.collection('users');
    const user = await collectionUsers.findOne(credentials);
    if (!user) {
        client.close();
        return {
            success: false,
            error: 'Authentication failed'
        };
    }
    client.close();
    return {
        success: true,
        data: {
            token: {
                uid: user._id.toHexString(),
                email: user.email,
                password: user.password,
                role: user.role
            },
            username: user.name
        }
    };
}

async function signup(data) {
    const userInfo = data.userInfo;
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
        createtime: getFormattedTimeString()
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
    var formattedUid;
    try {
        formattedUid = new ObjectId(uid);
    } catch (e) {
        console.error(e + '[read profile with uid]');
        return {
            success: false,
            error: e
        };
    }
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionProfiles = db.collection('profiles');
    const profile = await collectionProfiles.findOne({ _id: formattedUid });
    const response = {};
    if (profile) {
        response.success = true;
        profile.uid = profile._id.toHexString();
        delete profile._id;
        response.data = { profile: profile };
    } else {
        response.success = false;
        response.error = 'Profile not found (uid=' + uid + ')';
        console.error('Profile not found (uid=' + uid + ')');
    }
    client.close();
    return response;
}

async function getDashboardByUid(uid) {
    var formattedUid;
    try {
        formattedUid = new ObjectId(uid);
    } catch (e) {
        console.error(e + '[read profile with uid]');
        return {
            success: false,
            error: e
        };
    }
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionUsers = db.collection('users');
    const user = await collectionUsers.findOne({ _id: formattedUid });
    if (!user) {
        client.close();
        return {
            success: false,
            error: "Invalid user id"
        };
    }
    const collectionAlbums = db.collection('albums');
    const allAlbums = await collectionAlbums.find({uid: user._id}).toArray();
    allAlbums.forEach((album) => {
        album.aid = album._id.toHexString();
        delete album._id;
    });
    client.close();
    return {
        success: true,
        data: { albums: allAlbums}
    };
}

async function createAlbumWithAuth(data) {
    const token = data.token;
    const title = data.title;
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionUsers = db.collection('users');
    const credentials = {
        email: token.email,
        password: token.password
    }
    const user = await collectionUsers.findOne(credentials);
    if (!user) {
        client.close();
        return {
            success: false,
            error: "Athentication failed"
        };
    }
    const collectionAlbums = db.collection('albums');
    try {
        const insertedAlbum = await collectionAlbums.insertOne({
            uid: user._id,
            title: title,
            createtime: getFormattedTimeString(),
            size: 0
        });
        client.close();
        return {
            success: true,
            data: {
                aid: insertedAlbum.insertedId.toHexString()
            }
        };
    } catch (e) {
        client.close();
        console.error(e + "[create album (title=" + title + ")]");
        return {
            success: false,
            error: e
        };
    }
}

async function updateAlbumWithAuth(data) {
    const token = data.token;
    const aid = data.aid;
    const albumInfo = data.albumInfo;
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionUsers = db.collection('users');
    const credentials = {
        email: token.email,
        password: token.password
    }
    const user = await collectionUsers.findOne(credentials);
    if (!user) {
        client.close();
        return {
            success: false,
            error: "Athentication failed"
        };
    }
    const collectionAlbums = db.collection('albums');
    var formattedAid;
    try {
        formattedAid = new ObjectId(aid);
    } catch (e) {
        client.close();
        console.error('Invalid aid ' + aid);
        return {
            success: false,
            error: 'Invalid aid' + aid
        };
    }
    const album = await collectionAlbums.findOne({ _id: formattedAid, uid: user._id });
    if (!album) {
        client.close();
        return {
            success: false,
            error: 'You are not the author of the album'
        };
    }
    const newValues = {
        $set: {
            title: albumInfo.title,
            intro: albumInfo.intro
        }
    };
    const updateResult = await collectionAlbums.updateOne({ _id: formattedAid }, newValues);
    const response = {};
    if (updateResult.acknowledged) {
        response.success = true;
    } else {
        response.success = false;
        response.error = "Error updating album";
    }
    client.close();
    return response;
}

async function deleteAlbumsWithAuth(data) {
    const token = data.token;
    const aidList = data.aidList;
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionUsers = db.collection('users');
    const credentials = {
        email: token.email,
        password: token.password
    }
    const user = await collectionUsers.findOne(credentials);
    if (!user) {
        client.close();
        return {
            success: false,
            error: "Authentication failed"
        };
    }
    const collectionAlbums = db.collection('albums');
    var promiseList = [];
    aidList.forEach(aid => {
        try {
            const formattedAid = new ObjectId(aid);
            promiseList.push(new Promise(res => res(collectionAlbums.deleteOne({ _id: formattedAid, uid: user._id }))));
        } catch (e) {
            console.error(e + "[aid=" + aid + "]");
        }
    });
    const response = await Promise.all(promiseList)
        .then(results => results.reduce((acc, result) => acc + (result.acknowledged ? result.deletedCount : 0)))
        .then(count => { return { success: true, data: { count: count } } });
    client.close();
    return response;
}

async function getAllUsersWithAuth(data) {
    const token = data.token;
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
    if (user && user.role <= 1) {
        const allUsers = await collectionUsers.find({ role: { $gt: user.role} }, {password: 0, role: 0}).toArray();
        allUsers.forEach((_user) => {
            _user.uid = _user._id.toHexString();
            delete _user._id;
        });
        response.success = true;
        response.data = { users: allUsers };
    } else {
        response.success = false,
        response.error = "You do not have the access right";
        console.error('You do not have the access right[get user list]')
    }
    client.close();
    return response;
}

async function deleteUsersWithAuth(data) {
    const token = data.token;
    const uidList = data.uidList;
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionUsers = db.collection('users');
    const credentials = {
        email: token.email,
        password: token.password
    }
    const user = await collectionUsers.findOne(credentials);
    if (user && user.role <= 1) {
        var promiseList = [];
        uidList.forEach(uid => {
            try {
                const formattedUid = new ObjectId(uid);
                promiseList.push(new Promise(res => res(collectionUsers.deleteOne({ _id: formattedUid, role: { $gt: user.role } }))));
            } catch (e) {
                console.error(e + "[uid=" + uid + "]");
            }
        });
        const response = await Promise.all(promiseList)
            .then(results => results.reduce((acc, result) => acc + (result.acknowledged ? result.deletedCount : 0)))
            .then(count => { return { success: true, data: { count: count } } });
        client.close();
        return response;
    } else {
        client.close();
        console.error("Authentication failed[delete a list of users]");
        return {
            success: false,
            error: "Authentication failed"
        };
    }
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
        response.data = { album: album };
    } else {
        response.success = false;
        response.error = 'Album not found (aid=' + aid + ')';
        console.error('Album not found (aid=' + aid + ')');
    }
    client.close();
    return response;
}


const mongodbAPI = {
    login: login,  // credentials -> {email: xxx, password: xxx}
    signup: signup,  // userInfo -> {email: xxx, password: xxx, gender: xxx, age: xxx}
    getDashboardByUid: getDashboardByUid,  // uid
    createAlbumWithAuth: createAlbumWithAuth,  // token, title
    updateAlbumWithAuth: updateAlbumWithAuth,  // token, aid, albumInfo
    deleteAlbumsWithAuth: deleteAlbumsWithAuth,  // token, aidList
    getAllUsersWithAuth: getAllUsersWithAuth,  // token
    deleteUsersWithAuth: deleteUsersWithAuth,  // token, aidList
    getProfileByUid: getProfileByUid,  // uid
    getAlbumByAid: getAlbumByAid  // aid
};

serverStart(serverPort, mongodbAPI);