const express = require("express");
const app = express();
const mongoose = require("mongoose");
require('dotenv').config();
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT || 8000;

// Importing routes
const userRoute = require("./routes/user");
const vaccinationCentreRoute = require("./routes/vaccination-centre");
const bookSlotRoutes = require("./routes/book-slot");


const admin = encodeURIComponent(process.env.ADMIN);
const password = encodeURIComponent(process.env.PASSWORD);
const cluster = process.env.CLUSTER;
const testDatabaseURL = `mongodb+srv://${admin}:${password}@${cluster}/?retryWrites=true&w=majority`;
const databaseURL = process.env.MONGODB_URI || process.env.LOCAL_DATABASE;

// Database connection
mongoose.connect(databaseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("DATABASE CONNECTED");
}).catch((error) => { console.log("FAILED TO CONNECT TO DATABASE", error); });

// Using cors and body-parser
app.use(cors());
app.use(bodyParser.json());

app.use(userRoute);
app.use(vaccinationCentreRoute);
app.use(bookSlotRoutes);

app.listen(PORT, () => console.log(`app is live at port ${PORT}`));