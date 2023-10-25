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

const allowedDomains = [
  "http://localhost:8080",
  "http://192.168.1.10:8080",
  "http://192.168.1.11:8080",
  "http://192.168.1.12:8080",
  "http://192.168.1.13:8080",
  "http://192.168.1.14:8080",
  "http://192.168.1.15:8080",
  "http://192.168.1.51:8080",
  "http://169.254.19.172:8080",
  "http://169.254.109.134:8080",
  "http://localhost:9000",
  "http://192.168.1.10:9000",
  "http://192.168.1.11:9000",
  "http://192.168.1.12:9000",
  "http://192.168.1.13:9000",
  "http://192.168.1.14:9000",
  "http://192.168.1.15:9000",
  "http://192.168.1.51:9000",
  "http://169.254.19.172:9000",
  "http://169.254.109.134:9000",
  "http://localhost:9200",
  "http://192.168.1.10:9200",
  "http://192.168.1.11:9200",
  "http://192.168.1.12:9200",
  "http://192.168.1.13:9200",
  "http://192.168.1.14:9200",
  "http://192.168.1.15:9200",
  "http://192.168.1.51:9200",
  "http://169.254.19.172:9200",
  "http://169.254.109.134:9200",
  "http://localhost:9500",
  "http://192.168.1.10:9500",
  "http://192.168.1.11:9500",
  "http://192.168.1.12:9500",
  "http://192.168.1.13:9500",
  "http://192.168.1.14:9500",
  "http://192.168.1.15:9500",
  "http://192.168.1.51:9500",
  "http://169.254.19.172:9500",
  "http://169.254.109.134:9500",
  "https://www.kifkaf.app",
  "https://kifkaf.app",
  "https://lemon-bay-09625be03.3.azurestaticapps.net",
  "capacitor://localhost",
];
// app.use(cors()); // Enable All CORS Requests Be careful with this in a production setting as it allows any website to interact with your API. In a production setting, you should restrict this to just your own domains.
// app.use(cors({ // Enable CORS Requests from a single domain
//   origin: 'http://your-domain.com'
// }));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow requests with no origin like mobile apps or curl requests
      if (allowedDomains.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  }),
);
app.use("/api/chat", chatRouter);
app.use("/api/learn", learnRouter);

module.exports = app;
