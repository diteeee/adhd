require('dotenv').config();
const express = require("express");
const app = express();
const cors = require('cors');
const mongoose = require("mongoose");
const path = require('path');

app.use(express.json());
app.use(cors());
const jwt = require("jsonwebtoken");

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = require("./models");

// routers
const userRouter = require('./routes/Users');
app.use("/users", userRouter);

const addressRouter = require('./routes/Addresss');
app.use("/addresss", addressRouter);

const categoryRouter = require('./routes/Categorys');
app.use("/categorys", categoryRouter);

const productRouter = require('./routes/Products');
app.use("/products", productRouter);

const orderRouter = require('./routes/Orders');
app.use("/orders", orderRouter);

const orderItemRouter = require('./routes/OrderItems');
app.use("/orderItems", orderItemRouter);

const paymentRouter = require('./routes/Payments');
app.use("/payments", paymentRouter);

const reviewRouter = require('./routes/Reviews');
app.use("/reviews", reviewRouter);

const wishlistRouter = require('./routes/Wishlists');
app.use("/wishlists", wishlistRouter);

const cartRouter = require('./routes/Carts');
app.use("/carts", cartRouter);

const signInRouter = require('./routes/SignIn');
app.use("/signin", signInRouter);


mongoose.connect("mongodb://127.0.0.1:27017/adhd", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    db.sequelize.sync().then(() => {
      app.listen(3001, () => {
        console.log("Server on 3001");
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
      });
    });
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});
