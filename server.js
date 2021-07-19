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

    // read vids list by aid
    app.get('/albumcontents/:aid', (req, res) => {
        const aid = req.params.aid;
        api.getContentsByAid(aid).then(response => res.send(response));
    });

    app.post('/albumcontents', (req, res) => {
        const data = req.body.data;
        switch (req.body.type) {
            // insert vid into album.contents with auth
            case 'insert':
                api.insertVidByAidWithAuth(data).then(response => res.send(response));
                return;
        }
    });

    app.listen(port, () => console.log('API is running at port ' + port));
};


const mongodbPort = 27017;
const { MongoClient, ObjectId } = require('mongodb');
const url = "mongodb://localhost:" + mongodbPort;


async function authenticate(token) {
    if (!token.email || !token.password) return undefined;
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionUsers = db.collection('users');
    const user = await collectionUsers.findOne({ email: token.email, password: token.password });
    client.close();
    return user;
}

async function login(data) {
    const credentials = data.credentials;
    const user = await authenticate(credentials);
    if (!user) {
        return {
            success: false,
            error: 'Authentication failed'
        };
    }
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
    const user = await authenticate(token);
    if (!user) {
        return {
            success: false,
            error: "Athentication failed"
        };
    }
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionAlbums = db.collection('albums');
    const collectionAlbumContents = db.collection('album.contents');
    try {
        const insertedAlbum = await collectionAlbums.insertOne({
            uid: user._id,
            title: title,
            createtime: getFormattedTimeString(),
            size: 0
        });
        const aid = insertedAlbum.insertedId;
        await collectionAlbumContents.insertOne({
            _id: aid,
            title: title,
            vids: []
        });
        client.close();
        return {
            success: true,
            data: {
                aid: aid.toHexString()
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
    const user = await authenticate(token);
    if (!user) {
        return {
            success: false,
            error: "Athentication failed"
        };
    }
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
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
    const collectionAlbumContents = db.collection('album.contents');
    const albumContent = await collectionAlbumContents.findOne({ _id: formattedAid });
    if (!albumContent) {
        client.close();
        return {
            success: false,
            error: 'Error dealing with persistence of database'
        };
    }
    const newValuesAlbum = {
        $set: {
            title: albumInfo.title,
            intro: albumInfo.intro
        }
    };
    const newValuesAlbumContent = {
        $set: {
            title: albumInfo.title
        }
    };
    const updatePromiseList = [];
    updatePromiseList.push(new Promise(res => res(collectionAlbums.updateOne({ _id: formattedAid }, newValuesAlbum))));
    updatePromiseList.push(new Promise(res => res(collectionAlbumContents.updateOne( { _id: formattedAid }, newValuesAlbumContent))));
    await Promise.all(updatePromiseList);
    client.close();
    return {
        success: true,
        data: null
    };
}

async function deleteAlbumsWithAuth(data) {
    const token = data.token;
    const aidList = data.aidList;
    const user = await authenticate(token);
    if (!user) {
        return {
            success: false,
            error: "Authentication failed"
        };
    }
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionAlbums = db.collection('albums');
    const deletePromiseListAlbums = [];
    const formattedAidList = [];
    aidList.forEach(aid => {
        try {
            const formattedAid = new ObjectId(aid);
            formattedAidList.push(formattedAid);
            deletePromiseListAlbums.push(new Promise(res => res(collectionAlbums.deleteOne({ _id: formattedAid, uid: user._id }))));
        } catch (e) {
            console.error(e + "[aid=" + aid + "]");
        }
    });
    const collectionAlbumContents = db.collection('album.contents');
    const deletePromiseListAlbumContents = [];
    await Promise.all(deletePromiseListAlbums)
        .then(results => results.forEach((result, ind) => {
            if (result.acknowledged) {
                const formattedAid = formattedAidList[ind];
                deletePromiseListAlbumContents.push(new Promise(res => res(collectionAlbumContents.deleteOne({ _id: formattedAid }))));
            }
        }));
    await Promise.all(deletePromiseListAlbumContents);
    client.close();
    return {
        success: true,
        data: null
    };
}

async function getAllUsersWithAuth(data) {
    const token = data.token;
    const user = await authenticate(token);
    if (!user) {
        return {
            success: false,
            error: "Athentication failed"
        };
    } else if (user.role > 1) {
        return {
            success: false,
            error: "You do not have the access right"
        };
    }
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionUsers = db.collection('users');
    const allUsers = await collectionUsers.find({ role: { $gt: user.role} }, {password: 0, role: 0}).toArray();
    allUsers.forEach((_user) => {
        _user.uid = _user._id.toHexString();
        delete _user._id;
    });
    client.close();
    return {
        success: true,
        data: {
            users: allUsers
        }
    };
}

async function deleteUsersWithAuth(data) {
    const token = data.token;
    const uidList = data.uidList;
    const user = await authenticate(token);
    if (!user) {
        return {
            success: false,
            error: "Athentication failed"
        };
    } else if (user.role > 1) {
        return {
            success: false,
            error: "You do not have the access right"
        };
    }
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionUsers = db.collection('users');
    const deletePromiseListUsers = [];
    const formattedUidList = [];
    uidList.forEach(uid => {
        try {
            const formattedUid = new ObjectId(uid);
            formattedUidList.push(formattedUid);
            deletePromiseListUsers.push(new Promise(res => res(collectionUsers.deleteOne({ _id: formattedUid, role: { $gt: user.role } }))));
        } catch (e) {
            console.error(e + "[uid=" + uid + "]");
        }
    });
    const collectionProfiles = db.collection('profiles');
    const deletePromiseListProfiles = [];
    await Promise.all(deletePromiseListUsers)
        .then(results => results.forEach((result, ind) => {
            if (result.acknowledged) {
                const formattedUid = formattedUidList[ind];
                deletePromiseListProfiles.push(new Promise(res => res(collectionProfiles.deleteOne({ _id: formattedUid }))));
            }
        }));
    client.close();
    return {
        success: true,
        data: null
    };
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

async function getContentsByAid(aid) {
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
    const collectionAlbumContents = db.collection('album.contents');
    const albumContents = await collectionAlbumContents.findOne({ _id: formattedId });
    const response = {};
    if (albumContents) {
        response.success = true;
        response.data = {
            title: albumContents.title,
            vids: albumContents.vids
        };
    } else {
        response.success = false;
        response.error = "Album not found (aid=" + aid + ")"
    }
    client.close();
    return response;
}

async function insertVidByAidWithAuth(data) {
    const token = data.token;
    const vid = data.vid;
    const aid = data.aid;
    var formattedAid;
    try {
        formattedAid = new ObjectId(aid);
    } catch (e) {
        return {
            success: false,
            error: "Invalid vid or aid"
        };
    }
    const user = await authenticate(token);
    if (!user) {
        return {
            success: false,
            error: "Authentication failed"
        };
    }
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collectionAlbums = db.collection('albums');
    const album = await collectionAlbums.findOne({ _id: formattedAid, uid: user._id });
    if (!album) {
        client.close();
        return {
            success: false,
            error: "Authentication failed"
        };
    }
    const collectionAlbumContents = db.collection('album.contents');
    const newValuesAlbumContent = {
        $addToSet: {
            vids: vid
        }
    };
    const insertResult = await collectionAlbumContents.updateOne({ _id: formattedAid }, newValuesAlbumContent);
    if (insertResult.acknowledged && insertResult.modifiedCount > 0) {
        const newValuesAlbum = {
            $inc: {
                size: 1
            }
        };
        await collectionAlbums.updateOne({ _id: formattedAid }, newValuesAlbum);
    }
    client.close();
    return {
        success: true,
        data: null
    };
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
    getAlbumByAid: getAlbumByAid,  // aid
    getContentsByAid: getContentsByAid,  // aid
    insertVidByAidWithAuth: insertVidByAidWithAuth  // token, vid, aid
};

serverStart(serverPort, mongodbAPI);