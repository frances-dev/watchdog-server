const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
// const { ObjectId } = require('mongodb');
const app = express()
const port = 5000
require("dotenv").config();
const ObjectId = require('mongodb').ObjectId;


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://shahriar49:Liza0174@cluster0.v5isl.mongodb.net/WatchDog?retryWrites=truenpm&w=majority`;
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const servicesCollection = client.db("WatchDog").collection("services");
    const userServicesCollection = client.db("WatchDog").collection("userServices");
    const reviewCollection = client.db("WatchDog").collection("review");
    const adminCollection = client.db("WatchDog").collection("admin");

    // Uploading Services
    app.post("/addService", (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const bed = req.body.bed;
        const bath = req.body.bath;
        const price = req.body.price;
        const location = req.body.location;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        servicesCollection.insertOne({ name, bed, bath, price, location, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    //   Show Services to home
    app.get('/services', (req, res) => {
        servicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // Details
    app.get('/book/:_id', (req, res) => {
        servicesCollection.find({ _id: ObjectId(req.params._id) })
            .toArray((err, documents) => {
                res.send(documents[0]);
            });
    });

    // Adding Admin via email
    app.post("/addAdmin", (req, res) => {
        const email = req.body.email;
        adminCollection.insertOne({ email })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // Adding Order
    app.post("/addOrder", (req, res) => {
        const name = req.body.name;
        const desc = req.body.desc;
        const email = req.body.email;
        const service = req.body.service;
        const price = req.body.price;


        userServicesCollection.insertOne({ name, desc, email, service, price })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // Showing Order
    app.get('/allOrders', (req, res) => {
        userServicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    // Making Review
    app.post("/review", (req, res) => {
        const name = req.body.name;
        const desig = req.body.desig;
        const desc = req.body.desc;
        const img = req.body.photo;
        reviewCollection.insertOne({ name, desig, desc, img })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // Get Review Collection
    app.get('/getReview', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // Status
    app.patch("/addStatus/:id", (req, res) => {
        const status = req.body.status;
        // console.log(status);
        userServicesCollection.updateOne(
            { _id: ObjectId(req.params.id) },
            { $set: { status } }
        )
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // Finding Admin
    app.get('/findAdmin/:email', (req, res) => {
        adminCollection.find({ email: req.params.email })
            // console.log(req.params.email)
            .toArray((err, documents) => {
                res.send(documents.length > 0);
            })
    })

    //   // CRUD READ method (R) //     //
    app.get("/orders", (req, res) => {
        const bearer = req.headers.authorization
        if (bearer && bearer.startsWith('Bearer ')) {

            const idToken = bearer.split(' ')[1];

            // idToken comes from the client app
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    let uid = decodedToken.uid;
                    // console.log({uid});

                    // // custom verification with email // //
                    if (tokenEmail == queryEmail) {
                        userServicesCollection.find({ email: queryEmail })
                            .toArray((err, documents) => {
                                res.status(200).send(documents);
                            })
                    }
                    else {
                        res.status(401).send("Unauthorized access!!")
                    }
                }).catch(function (error) {
                    res.status(401).send("Unauthorized access!!")
                    // Handle error
                });
        }

        else {
            res.status(401).send("Unauthorized access!!")
        }
    })
});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port)