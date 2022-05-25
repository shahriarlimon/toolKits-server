const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.ypd6p.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const toolCollection = client.db("tool_kits").collection("tools");
    const orderCollection = client.db("tool_kits").collection("orders");
    const paymentCollection = client.db("tool_kits").collection("payments");
    const reviewCollection = client.db("tool_kits").collection("reviews");
    const userCollection = client.db("tool_kits").collection("users");
    const profileCollection = client.db("tool_kits").collection("profiles");

    const verifyAdmin = async (req, res, next) => {
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({ email: requester });
      if (requesterAccount.role === 'admin') {
        next();
      }
      else {
        res.status(403).send({ message: 'forbidden' });
      }
    };
   
    app.post('/add-tool',verifyJWT,verifyAdmin, async(req,res)=>{
      const tool = req.body;
      const result = await toolCollection.insertOne(tool);
      res.send({
        status: true,
        message: " Congrats! You successfully added the tool",
      });

    });
   
    app.get("/get-tools", async (req, res) => {
      const tools = await toolCollection.find().toArray();
      res.send(tools);
    });
    app.get('/get-reviews', async(req,res)=>{
      const reviews = await reviewCollection.find().toArray();
      res.send(reviews);
    })
    app.get("/get-tool/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const tool = await toolCollection.findOne(filter);
      res.send(tool);
    });
    app.get("/get-order/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const tool = await orderCollection.findOne(filter);
      res.send(tool);
    });
    app.get('/get-orders/:email',verifyJWT, async(req,res)=>{
      const email = req.params.email;
      const filter = {email:email};
      const orders = await orderCollection.find(filter).toArray()
      res.send(orders)
    });
     
    app.get('/user', async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.access_secrete_token, { expiresIn: '1h' })
      res.send({ result, token });
    });
    app.get('/admin/:email',verifyJWT,verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === 'admin';
      res.send({ admin: isAdmin })
    })
    app.put('/user/admin/:email', verifyJWT,verifyAdmin,  async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: 'admin' },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    })



   
    app.post("/create-order",verifyJWT, async (req, res) => {
      const order = req.body
        const result = await orderCollection.insertOne(order);
        res.send({
          status: true,
          message: " Congrats! Your order has been placed",
        });
  
    });
    app.post('/create-review', verifyJWT, async(req,res)=>{
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send({status:true,message:'Your review has been added'});
    })
    app.delete('/delete-order/:id', async(req,res)=>{
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send({success:true,message:'Successfully cancelled your order'})
    });
    app.post('/create-payment-intent', verifyJWT, async(req, res) =>{
      const order = req.body;
      const price = order.price;
      const amount = price;
      const paymentIntent = await stripe.paymentIntents.create({
        amount : amount,
        currency: 'usd',
        payment_method_types:['card']
      });
      res.send({clientSecret: paymentIntent.client_secret})
    });
    app.patch('/get-order/:id',verifyJWT,  async(req, res) =>{
      const id  = req.params.id;
      const payment = req.body;
      const filter = {_id: ObjectId(id)};
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId
        }
      }

      const result = await paymentCollection.insertOne(payment);
      const updatedOrder = await orderCollection.updateOne(filter, updatedDoc);
      res.send(updatedOrder);
    });
    app.post('/create-profile',verifyJWT, async(req,res)=>{
      const email = req.params.email
      const profile = req.body;
      const result = await profileCollection.insertOne(profile);
      res.send({
        status: true,
        message: " Congrats! Your have successfully updated your profile",
      }); 

    })
  } finally {
  }
}
run().catch(console.dir);

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.access_secrete_token, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}
app.get("/", async (req, res) => {
  res.send("tool kits is running");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
