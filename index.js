const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET)


const app = express();
const port = process.env.PORT || 5000;
//middle wire
app.use(cors());
app.use(express.json());

//add User pass from dotenv

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uompt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Run named Function for server to db
async function run() {
    try {

        //making db and Collection on database
        await client.connect();
        const database = client.db('Deal&Sale');
        const productsCollection = database.collection('Products');
        const cartsCollection = database.collection('Carts');
        const wishesCollection = database.collection('Wishes');
        const usersCollection = database.collection('Users');
        const paymentsCollection = database.collection('Payments');


        // finding user data for user
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.json(user);
        })
        //Delete It
        app.get('/users', async (req, res) => {
            const users = usersCollection.find({});
            const myDetails = await users.toArray();
            res.json(myDetails);
        })

        app.get('/products', async (req, res) => {
            const users = productsCollection.find({});
            const myDetails = await users.toArray();
            res.json(myDetails);
        })
        app.get('/carts/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const cursor = cartsCollection.find(query);
            const result = await cursor.toArray();
            res.json(result)
        })
        app.get('/payments/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const cursor = paymentsCollection.find(query);
            const result = await cursor.toArray();
            res.json(result)
        })

        // Adding carts for Clint
        app.post('/carts', async (req, res) => {
            const user = req.body;
            const result = await cartsCollection.insertOne(user);
            res.json(result);
        });

        app.get('/wishes/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const cursor = wishesCollection.find(query);
            const result = await cursor.toArray();
            res.json(result)
        })
        // Adding wishes for Clint
        app.post('/create-payment-intent', async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                payment_method_types: ['card']
            });
            res.json({ clientSecret: paymentIntent.client_secret })
        })
        app.post('/wishes', async (req, res) => {
            const user = req.body;
            const result = await wishesCollection.insertOne(user);
            res.json(result);
        });
        app.post('/payments', async (req, res) => {
            const user = req.body;
            const result = await paymentsCollection.insertOne(user);
            res.json(result);
        });

        // Adding product from admin Dashboard 
        app.post('/products', async (req, res) => {
            const user = req.body;
            const result = await productsCollection.insertOne(user);
            res.json(result);
        });

        //Adding user those who register buy Email
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });
        //sending data to db
        app.post('/products', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await productsCollection.insertOne(user);
            res.json(result);
        });
        // Adding user those who register buy google 
        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/payments/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    payment: payment,
                    activeStatus:1
                }
            };
            const result = await paymentsCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await cartsCollection.deleteOne(query);
            res.json(result);
        })
        app.delete('/allCarts/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: { $regex: `${email}` } };
            // const query = { _id: ObjectId(id) };
            const result = await cartsCollection.deleteMany(query);
            res.json(result);
        })
        
        app.delete('/wishes/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await wishesCollection.deleteOne(query);
            res.json(result);
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


//checking first time
app.get('/', (req, res) => {
    res.send('lets Deal and Sale !');
});

app.listen(port, () => {
    console.log('listening at', port);
});