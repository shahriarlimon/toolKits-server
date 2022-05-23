const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

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
    app.get("/get-tools", async (req, res) => {
      const tools = await toolCollection.find().toArray({});
      res.send(tools);
    });
    app.get("/get-tool/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const tool = await toolCollection.findOne(filter);
      res.send(tool);
    });
    app.post("/login", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.access_secrete_token);
      res.send({ token: token });
    });
    app.post("/create-order", async (req, res) => {
      const order = req.body;
      const tokenInfo = req.headers.authorization;
      const [email, access_token] = tokenInfo.split(" ");
      const decoded = verifyToken(access_token);
      if (decoded.email === email) {
        const result = await orderCollection.insertOne(order);
        res.send({
          status: true,
          message: " Congrats! Your order has been placed",
        });
      } else {
        res.send({ status:false, message: "Unauthorized access" });
      }
    });
  } finally {
  }
}
run().catch(console.dir);

function verifyToken(token) {
  let email;
  jwt.verify(token, process.env.access_secrete_token, function (err, decoded) {
    if (err) {
      email = "Invalid email";
    }
    if (decoded) {
      email = decoded;
    }
  });
  return email;
}
app.get("/", async (req, res) => {
  res.send("tool kits is running");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
