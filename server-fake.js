const serverStart = function (port) {
    const express = require('express');
    const cors = require('cors');
    const app = express();

    app.use(express.json());
    app.use(cors());

    // user log in
    app.post('/login', (req, res) => {
        res.send({
            token: {
                uid: 10,
                email: req.body.email,
                password: req.body.password
            },
            role: 1
        });
    });

    // user sign up
    app.post('/signup', (req, res) => {
        res.send({
            token: {
                uid: 11,
                email: req.body.info.email,
                password: req.body.info.password
            },
            role: 2
        });
    });

    // fetch user profile with uid
    app.get('/profile/:uid', (req, res) => {
        const uid = req.params.uid;
        console.log(uid);
        res.send({
            uid: uid,
            email: uid + "@amazon.com",
            name: 'Amazonian',
            gender: 'MALE',
            age: 29
        });
    });

    // fetch user's albums list
    app.post('/album', (req, res) => {
        const albums = [
            {
                aid: "1",
                cover: "cover1",
                title: "title1",
                size: "size1",
                createtime: "createtime1"
            },
            {
                aid: "2",
                cover: "cover2",
                title: "title2",
                size: "size2",
                createtime: "createtime2"
            }
        ];
        res.send(albums);
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
    app.post('/user', (req, res) => {
        const users = [{
            uid: 111222,
            name: "fake admin",
            gender: "Male",
            age: 123,
            createtime: "2021-07-16"
        }];
        res.send(users);
    });

    app.listen(port, () => console.log('API is running at port ' + port));
}


serverStart(8080);