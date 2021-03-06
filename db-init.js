const dbName = 'memento';

const mongodbPort = 27017;
const { MongoClient, ObjectId } = require('mongodb');
const url = "mongodb://localhost:" + mongodbPort;


const dropDatabase = async () => {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    await db.dropDatabase();
    client.close();
}


// ****************
// Define DB Schema
// ****************

const schemaUsers = {
    $jsonSchema: {
        bsonType: "object",
        required: ['email', 'password', 'name', 'role'],
        properties: {
            email: {
                bsonType: "string",
                description: "email as a string containing only lower cases; should be unique"
            },
            password: {
                bsonType: "string",
                description: "uncrypted password"
            },
            name: {
                bsonType: "string",
                description: "username"
            },
            role: {
                bsonType: "int",
                minimum: 0,
                description: "priority level (the less, the more powerful)"
            }
        }
    }
}

const schemaProfiles = {
    $jsonSchema: {
        bsonType: "object",
        required: ['name', 'gender', 'age', 'createtime'],
        properties: {
            name: {
                bsonType: "string",
                description: "username"
            },
            gender: {
                enum: ['Male', 'Female', 'Other'],
                description: "gender as an enum"
            },
            age: {
                bsonType: "int",
                minimum: 1,
                maximum: 201,
                description: "age range from 1 to 200 inclusively"
            },
            createtime: {
                bsonType: "string",
                description: "createtime"
            }
        }
    }
}

const schemaAlbums = {
    $jsonSchema: {
        bsonType: "object",
        required: ['uid', 'title', 'createtime', 'size'],
        properties: {
            uid: {
                bsonType: "objectId",
                description: "uid of the author as ObjectId"
            },
            title: {
                bsonType: "string",
                description: "title"
            },
            createtime: {
                bsonType: "string",
                description: "createtime"
            },
            size: {
                bsonType: "int",
                minimum: 0,
                description: "the size of this album"
            },
            intro: {
                bsonType: "string",
                description: "intro"
            }
        }
    }
}

const schemaAlbumContents = {
    $jsonSchema: {
        bsonType: "object",
        required: ['title', 'vids'],
        properties: {
            title: {
                bsonType: "string",
                description: "album title"
            },
            vids: {
                bsonType: "array",
                description: "a list of vids in the album",
                items: {
                    bsonType: "string",
                    description: "vid"
                }
            }
        }
    }
}


// *******************
// Insert default data
// *******************

const admins = [
    {
        _id: new ObjectId("000000000000000000000001"),
        email: "admin@memento.io",
        password: "11111111",
        name: "Admin",
        role: 1
    }
];

const users = [
    {
        _id: new ObjectId("000000000000000000000002"),
        email: "user@memento.io",
        password: "22222222",
        name: "User",
        role: 10
    }
];

const profiles = [
    {
        _id: new ObjectId("000000000000000000000001"),
        name: "Admin",
        gender: "Male",
        age: 1,
        createtime: "2020-01-01"
    },
    {
        _id: new ObjectId("000000000000000000000002"),
        name: "User",
        gender: "Female",
        age: 2,
        createtime: "2020-02-02"
    }
];

const albums = [
    {
        _id: new ObjectId("000000000000000000000001"),
        uid: new ObjectId("000000000000000000000002"),
        createtime: "2020-02-02",
        title: "Justin Bieber",
        intro: "Intro of example album 1",
        size: 7
    },
    {
        _id: new ObjectId("000000000000000000000002"),
        uid: new ObjectId("000000000000000000000002"),
        createtime: "2020-02-02",
        title: "Example album 2 for example user",
        intro: "Intro of example album 2",
        size: 1
    }
];

const albumContents = [
    {
        _id: new ObjectId("000000000000000000000001"),
        title: "Justin Bieber",
        vids: ["1_NVaujWgBg", "Ys7-6_t7OEQ", "tQ0yjYUFKAE", "3AyMjyHu1bA", "DK_0jXPuIr0", "MPbUaIZAaeA", "KIK3azN4w34"]
    },
    {
        _id: new ObjectId("000000000000000000000002"),
        title: "Example album 2 for example user",
        vids: ["ZAfAud_M_mg"]
    }
];



const insertItems = async (tableName, items) => {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(tableName);
    const insertResult = await collection.insertMany(items);
    console.log('Inserted items to ' + tableName + ' => ', insertResult);
    client.close();
}


// ****************************
// Handle the unique properties
// Handle the indexing
// ****************************

const createDatabaseAndTables = async () => {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    await db.createCollection("users", { validator: schemaUsers });
    await db.createCollection("profiles", { validator: schemaProfiles });
    await db.createCollection("albums", { validator: schemaAlbums });
    await db.createCollection("album.contents", { validator: schemaAlbumContents });
    await db.collection('users').createIndex({ 'email': 1 }, { unique: true });
    await db.collection('albums').createIndex({ 'uid': 1 });
    client.close();
}


// **********
// Automation
// **********

const mongodbInit = async function () {
    await dropDatabase();
    await createDatabaseAndTables();
    await insertItems('users', [...admins, ...users]);
    await insertItems('profiles', profiles);
    await insertItems('albums', albums);
    await insertItems('album.contents', albumContents);
    console.log("Database " + dbName + " successfully initialized");
}
mongodbInit();