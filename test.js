// // // const yourDate = new Date();
// // // const offset = yourDate.getTimezoneOffset();
// // // var convertedDate = new Date(yourDate.getTime() - (offset*60*1000));
// // // const formattedDate = convertedDate.toISOString().split('T')[0];

// // // console.log(Math.max("abc", "ddd"));


const { MongoClient, ObjectId } = require('mongodb');
// or as an es module:
// import { MongoClient } from 'mongodb';

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'memento';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection('profiles');

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

  const findResult = await collection.find({}).toArray();
  console.log('Found documents =>', findResult);

  // const findResult = await collection.findOne({
  //     _id: new ObjectId("000000000000000000000001"),
  //     uid: new ObjectId("000000000000000000000002")
  // });
  // console.log('Found documents =>', findResult);

//   const filteredDocs = await collection.find({ a: 3 }).toArray();
//   console.log('Found documents filtered by { a: 3 } =>', filteredDocs);

  // const updateResult = await collection.updateOne({ _id: new ObjectId("000000009000400000690098") }, { $set: { role: 100 } })
  // console.log('Updated documents =>', updateResult)

  // const deleteResult = await collection.deleteMany({ _id: 789 });
  // console.log('Deleted documents =>', deleteResult);

  // const findResult = await collection.deleteOne({
  //   _id: new ObjectId("000000000000000000000001"),
  //   uid: new ObjectId("000000000000000000000002")
  // });
  // console.log('Found documents =>', findResult);

//   await db.dropCollection('users');

  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());


// const fetch = require('node-fetch');

// const buildYoutubeVideoApi = (vid) => "https://www.googleapis.com/youtube/v3/videos?id=" + vid + "&key=AIzaSyBYNwfhjqubq1F57d8SrzeW11ByAd9FJ8k&fields=items(id,snippet(title,thumbnails),statistics)&part=snippet,statistics"

// const youtubeUrlRegex = /^(?:https?:)?(?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]{7,15})(?:[\?&][a-zA-Z0-9\_-]+=[a-zA-Z0-9\_-]+)*$/g;


// async function fetchDataYoutubeVideo(url) {
//     var vid;
//     try {
//         vid = url.split(youtubeUrlRegex)[1];
//     } catch (e) {
//         return {
//             success: false,
//             error: "Invalid URL for Youtube video [url=" + url + "]"
//         };
//     }
//     const api = buildYoutubeVideoApi(vid);
//     console.log(api);
//     const response = await fetch(api, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     })
//     .then(data => data.json());
//     console.log(response);
// }
// fetchDataYoutubeVideo("https://www.youtube.com/watch?v=poQXNp9ItL4");



// const url = "http://youtube.com/watch?v=ALZHF5UqnU4";

// const youtubeUrlRegex = /^(?:https?:)?(?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]{7,15})(?:[\?&][a-zA-Z0-9\_-]+=[a-zA-Z0-9\_-]+)*$/g;

// console.log(7 <= url.split(youtubeUrlRegex)[1].length <= 15);