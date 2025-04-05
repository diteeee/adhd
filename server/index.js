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

db.sequelize.sync().then(() => {
    app.listen(3001, () => {
        console.log("server running on port 3001");
    });
});