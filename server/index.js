const express = require("express");
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

const db = require('./models');

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

db.sequelize.sync().then(() => {
    app.listen(3001, () => {
        console.log("server running on port 3001");
    });
});