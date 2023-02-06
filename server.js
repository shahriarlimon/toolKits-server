const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const connectDb = require("./db/db");
const app = express();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const apiRoutes = require("./routes/apiRoutes")

app.use(cors({
    origin: true,
    optionsSuccessStatus: 200,
    credentials: true
}));
app.use(express.json());
/* connectDb */
connectDb()
app.get("/", async (req, res) => {
    res.send("tool kits is running");
});

app.use("/api/v1", apiRoutes)
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
