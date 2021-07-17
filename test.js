// const yourDate = new Date();
// const offset = yourDate.getTimezoneOffset();
// var convertedDate = new Date(yourDate.getTime() - (offset*60*1000));
// const formattedDate = convertedDate.toISOString().split('T')[0];

// console.log(Math.max("abc", "ddd"));


const { MongoClient, ObjectId } = require('mongodb');
// or as an es module:
// import { MongoClient } from 'mongodb';

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection('users');

    // try {
    //     const insertResult = await collection.insertOne({
    //         _id: new ObjectId("000000009000400000690098"),
    //         email: "admin@memento.io",
    //         password: "11111111",
    //         role: 1
    //     });
    //     console.log('Inserted documents =>', insertResult.insertedId.toHexString());
    // } catch (e) {
    //     console.error(e);
    // }

//   const findResult = await collection.find({}).toArray();
//   console.log('Found documents =>', findResult);

  const findResult = await collection.findOne({
      _id: new ObjectId("60f2323d498816313827f791")
  });
  console.log('Found documents =>', findResult._id.toHexString());

//   const filteredDocs = await collection.find({ a: 3 }).toArray();
//   console.log('Found documents filtered by { a: 3 } =>', filteredDocs);

//   await db.dropCollection('users');

  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());