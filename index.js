const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const cors = require('cors');


const app = express();
const port = process.env.PORT || 5000;

//middle wire
app.use(cors());
app.use(express.json());

//add User pass from dotenv

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uompt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Run named Function for server to db
async function run() {
    try {

        //making db and Collection on database
        await client.connect();
        const database = client.db('Deal&Sale');
        const productsCollection = database.collection('Products');
        const smpData = { tittle: 'Samsul Alam Sawon' }
        // this is using to send data 
        const dataFromDb = await productsCollection.insertOne(smpData);
        //This line prop that data had been insert
        console.log(`A document was inserted with the _id: ${dataFromDb.insertedId}`);

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


//checking first time
app.get('/', (req, res) => {
    res.send('Hello doctors Portal !');
});

app.listen(port, () => {
    console.log('listening at', port);
});