const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const chatRouter = require("./routes/chat");
const learnRouter = require("./routes/learn");

const app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
//TODO:4 The app.use(cors()) line enables all CORS requests. Be careful with this in a production setting as it allows any website to interact with your API. In a production setting, you should restrict this to just your own domains.
app.use(cors()); // Enable All CORS Requests
// app.use(cors({
//   origin: 'http://your-domain.com'
// }));
app.use("/api/chat", chatRouter);
app.use("/api/learn", learnRouter);

module.exports = app;
