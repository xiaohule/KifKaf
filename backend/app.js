require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

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

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
app.use("/", indexRouter);
app.use("/users", usersRouter);

const { OpenAI } = require("langchain/llms/openai"); // use require instead of import
const llm = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

app.get("/openai", async (req, res) => {
  // Add an async route for OpenAI predictions
  try {
    const result = await llm.predict(
      "What would be the good company name for a company that makes colorful socks?"
    );
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while making the prediction");
  }
});

module.exports = app;

//This is a very basic Express.js setup. From here, you'll probably want to add more functionality to your server, like a route for the OpenAI API or Llama calls, middleware for error handling, etc.

//how to deploy this using azure?
//https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs?pivots=platform-linux
//https://docs.microsoft.com/en-us/azure/app-service/configure-language-nodejs?pivots=platform-linux
