require('dotenv').config();
const express = require("express");
const app = express();
const cors = require('cors');
const mongoose = require("mongoose");
const path = require('path');
const http = require("http");
const { Server } = require("socket.io");

app.use(express.json());
app.use(cors());
const jwt = require("jsonwebtoken");

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = require("./models");

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", (userId) => {
        if (userId) {
            console.log(`User with ID ${userId} joined the room.`);
            socket.join(userId);
        } else {
            console.log("User ID is invalid or not provided.");
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// routers
const userRouter = require('./routes/Users');
app.use("/users", userRouter);

const addressRouter = require('./routes/Addresss');
app.use("/addresss", addressRouter);

const categoryRouter = require('./routes/Categorys');
app.use("/categorys", categoryRouter);

const productRouter = require('./routes/Products');
app.use("/products", productRouter);

const productVariantRouter = require('./routes/ProductVariants');
app.use("/productVariants", productVariantRouter);

const orderRouter = require('./routes/Orders');
app.use("/orders", orderRouter);

const orderItemRouter = require('./routes/OrderItems');
app.use("/orderItems", orderItemRouter);

const paymentRouter = require('./routes/Payments');
app.use("/payments", paymentRouter);

const returnRouter = require('./routes/Returns');
app.use("/returns", returnRouter);

const couponRouter = require('./routes/Coupons');
app.use("/coupons", couponRouter);

const reviewRouter = require('./routes/Reviews');
app.use("/reviews", reviewRouter);

const wishlistRouter = require('./routes/Wishlists');
app.use("/wishlists", wishlistRouter);

const cartRouter = require('./routes/Carts');
app.use("/carts", cartRouter);

const notificationRouter = require('./routes/Notifications')(io);
app.use("/notifications", notificationRouter);

const signInRouter = require('./routes/SignIn');
app.use("/signin", signInRouter);

// mongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/adhd", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        db.sequelize.sync().then(() => {
            server.listen(3001, () => {
                console.log("Server on 3001");
                console.log('JWT_SECRET:', process.env.JWT_SECRET);
            });
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });
