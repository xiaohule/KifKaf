var express = require("express");
var router = express.Router();

const { OpenAI } = require("langchain/llms/openai"); // use require instead of import
const { VectorStoreRetrieverMemory } = require("langchain/memory");
const { LLMChain } = require("langchain/chains");
const { PromptTemplate } = require("langchain/prompts");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
require("dotenv").config();

const llm = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  // temperature: 0.9,
});
// const prompt = PromptTemplate.fromTemplate(
//   "What is a good name for a company that makes {product}?"
// );
// const chain = new LLMChain({
//   llm,
//   prompt,
// });
// // /api/learn/openai route
// router.get("/openai", async (req, res) => {
//   console.log("IN OPENAI ROUTE");
//   // Add an async route for OpenAI predictions
//   try {
//     // Run is a convenience method for chains with prompts that require one input and one output.
//     const result = await chain.run("colorful socks");
//     res.send(result);
//     //There are a number of other response methods for ending the request/response cycle, for example, you could call res.json() to send a JSON response or res.sendFile() to send a file.
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("An error occurred while making the prediction");
//   }
// });

const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings()); // In Node.js defaults to process.env.OPENAI_API_KEY
const memory = new VectorStoreRetrieverMemory({
  // 1 is how many documents to return, you might want to return more, eg. 4
  vectorStoreRetriever: vectorStore.asRetriever(1),
  memoryKey: "history",
});

// /api/learn/openai2 route
router.get("/openai2", async (req, res) => {
  // Add an async route for OpenAI predictions
  try {
    // First let's save some information to memory, as it would happen when
    // used inside a chain.
    await memory.saveContext(
      { input: "My favorite food is pizza" },
      { output: "thats good to know" }
    );
    await memory.saveContext(
      { input: "My favorite sport is soccer" },
      { output: "..." }
    );
    await memory.saveContext(
      { input: "I don't like the Celtics" },
      { output: "ok" }
    );
    // Now let's use the memory to retrieve the information we saved.
    // async function retrieveMemory() {
    console.log(
      await memory.loadMemoryVariables({ prompt: "what sport should i watch?" })
    );
    // }
    // retrieveMemory();
    /*
{ history: 'input: My favorite sport is soccer\noutput: ...' }
*/
    // Now let's use it in a chain.
    const prompt =
      PromptTemplate.fromTemplate(`The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Relevant pieces of previous conversation:
{history}

(You do not need to use these pieces of information if not relevant)

Current conversation:
Human: {input}
AI:`);
    const chain2 = new LLMChain({ llm, prompt, memory });
    const res1 = await chain2.call({
      input: "Hi, my name is Perry, what's up?",
    });
    console.log({ res1 });
    /*
    {
      res1: {
        text: " Hi Perry, I'm doing great! I'm currently exploring different topics related to artificial intelligence like natural language processing and machine learning. What about you? What have you been up to lately?"
      }
    }
    */

    const res2 = await chain2.call({ input: "what's my favorite sport?" });
    console.log({ res2 });
    /*
    { res2: { text: ' You said your favorite sport is soccer.' } }
    */

    const res3 = await chain2.call({ input: "what's my name?" });
    console.log({ res3 });
    /*
    { res3: { text: ' Your name is Perry.' } }
    */

    // res.send(res2);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while making the prediction");
  }
});

// // /api/learn/ route
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });
// // /api/learn/needs route
// router.get("/needs", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });

module.exports = router;
