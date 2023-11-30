const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Products = require("./Products");
const Users = require("./Users");
const bcrypt = require("bcryptjs");
const Orders = require("./Orders");
const stripe = require("stripe") (
  "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"
);


const app = express();
const port = 3001;



// Middlewares
app.use(express.json());
app.use(cors());

// connection url

const connection_url =
  "mongodb+srv://ganga:12345@cluster0.leyjeyn.mongodb.net/Cluster0?retryWrites=true&w=majority";

  mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

//API

app.get("/", (req,res) => res.status(200).send("Home Page"));




// add product

// You need to add the async keyword before the function parameters.
app.post("/products/add", async (req, res) => {
  const productDetail = req.body;

  console.log("Product Detail >>>>", productDetail);

  try {
    // Because we're in an async function, it's okay to use await here.
    const data = await Products.create(productDetail);
    res.status(201).send(data);
  } catch (err) {
    res.status(500).send(err.message);
    console.log(err);
  }
});

app.get("/products/get", async (req, res) => {
  try {
    const data = await Products.find();
    res.status(200).send(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API for PAYMENT

app.post("/payment/create", async (req, res) => {
  const total = req.body.amount;
  console.log("Payment Request recieved for this ruppess", total);

  const payment = await stripe.paymentIntents.create({
    amount: total * 100,
    currency: "inr",
  });

  res.status(201).send({
    clientSecret: payment.client_secret,
  });
});


// API TO add ORDER DETAILS

app.post("/orders/add", async (req, res) => {
  const products = req.body.basket;
  const price = req.body.price;
  const email = req.body.email;
  const address = req.body.address; // There might be a mistake here. You had req.body.email twice.

  const orderDetail = {
    products: products,
    price: price,
    address: address,
    email: email,
  };

  try {
    const result = await Orders.create(orderDetail);
    console.log("order added to database >> ", result);
    res.status(201).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

app.post("/orders/get", (req, res) => {
  const email = req.body.email;

  Orders.find({ email: email }, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send(err.message);
    } else {
      res.status(200).send(result);
    }
  });
});


app.listen(port, () => console.log("listening on the port",port));
