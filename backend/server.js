const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const learnTabRouter = require("./routes/learnTab");

const app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
//TODO:3 The app.use(cors()) line enables all CORS requests. Be careful with this in a production setting as it allows any website to interact with your API. In a production setting, you should restrict this to just your own domains. You can do this by passing options to the cors function like so:
app.use(cors()); // Enable All CORS Requests
// app.use(cors({
//   origin: 'http://your-domain.com'
// }));
app.use("/api/learn", learnTabRouter);

module.exports = app;
