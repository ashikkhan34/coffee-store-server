const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleWare
app.use(cors())
app.use(express.json())

//added mongo db................

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xe3zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //send data to database......(1)
    const coffeeCollection = client.db('coffeeDB').collection('coffee')

    // get all data from database .....
    app.get('/coffee', async(req,res)=>{
      const cursor = coffeeCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    // receive data from clint site
    app.post('/coffee',async(req,res)=>{
      const newCoffee = req.body;
      console.log(newCoffee)
      //send data to database......(2)
      const result = await coffeeCollection.insertOne(newCoffee)
      res.send(result)
    })

    //delete a coffee card from clint site...
    app.delete('/coffee/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await coffeeCollection.deleteOne(query)
      res.send(result)
    })

    //update a coffee data.....find(id)
    app.get('/coffee/:id', async (req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await coffeeCollection.findOne(query)
      res.send(result)

    })

    // update data..........
    app.put('/coffee/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true}
      const updateCoffee = req.body;
      const coffee = {
        $set: {
          name:updateCoffee.name,
          quantity:updateCoffee.quantity,
          supplier:updateCoffee.supplier,
          taste:updateCoffee.taste,
         category:updateCoffee.category,
          details:updateCoffee.details,
          photo:updateCoffee.photo
        }
      }
      const result = await coffeeCollection.updateOne(filter,coffee,options)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('coffee making server is running')
})


app.listen(port, ()=>{
    console.log(`Coffee Server is running on port : ${port}`)
})
