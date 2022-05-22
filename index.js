const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.ypd6p.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      await client.connect();
      const toolCollection = client.db("tool_kits").collection("tools");
      console.log('Mongodb connected');
      
    } finally {
      
    }
  }
  run().catch(console.dir);



app.get("/", async (req, res) => {
    res.send("tool kits is running");
  });
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });