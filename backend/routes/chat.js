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
  temperature: 0.5, //It’s usually best to set a low temperature for tasks where the desired output is well-defined. Higher temperature may be useful for tasks where variety or creativity are desired, or if you'd like to generate a few variations for your end users or human experts to choose from.
});
// const prompt = PromptTemplate.fromTemplate(
//   "What is a good name for a company that makes {product}?"
// );
// const chain = new LLMChain({
//   llm,
//   prompt,
// });
// router.get("/openai", async (req, res) => {
//   console.log("IN OPENAI ROUTE");
//   // Add an async route for OpenAI predictions
//   try {
//     // Run is a convenience method for chains with prompts that require one input and one output.
//     const result = await chain.run("colorful socks");
//     res.send(result);
//     //There are a number of other response methods for ending the request/response cycle, for example, you could call res.json() to send a JSON response or res.sendFile() to send a file.
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("An error occurred while making the prediction");
//   }
// });

const vectorStore = new MemoryVectorStore(
  new OpenAIEmbeddings({
    verbose: true,
    openAIApiKey: process.env.OPENAI_API_KEY,
    // model: "gpt-3.5-turbo", //gpt-4
  }),
); // In Node.js defaults to process.env.OPENAI_API_KEY
const memory = new VectorStoreRetrieverMemory({
  // 1 is how many documents to return, you might want to return more, eg. 4
  vectorStoreRetriever: vectorStore.asRetriever(5),
  memoryKey: "loadedMoments",
});

// /api/chat/langchain1 route
router.get("/langchain1", async (req, res) => {
  try {
    // First let's save some information to memory, as it would happen when used inside a chain.
    await memory.saveContext(
      { input: "Felt so bad when running after eating spinach" },
      { output: "" },
    );
    await memory.saveContext(
      { input: "Feeling excited when calling mum" },
      { output: "" },
    );
    await memory.saveContext(
      { input: "Feeling both empty and full after movement class" },
      { output: "" },
    );
    await memory.saveContext(
      { input: "Feeling so stressed out today when woking up" },
      { output: "" },
    );
    await memory.saveContext(
      { input: "Feeling grateful toward life when eating my fresh tomatoes" },
      { output: "" },
    );
    await memory.saveContext(
      { input: "Feeling a little down today after calling mum" },
      { output: "" },
    );
    await memory.saveContext(
      { input: "Feeling proud of myself for working out today!" },
      { output: "" },
    );
    await memory.saveContext(
      { input: "Feeling moody bec. of the grey weather" },
      { output: "" },
    );
    await memory.saveContext(
      { input: "Sex with mona, good connection and sharing" },
      { output: "" },
    );
    await memory.saveContext(
      {
        input:
          "Feeling grateful and cuddled to have my tea prepared by Maria bec. proof of love",
      },
      { output: "" },
    );
    await memory.saveContext(
      { input: "Finally alone at home!" },
      { output: "" },
    );
    await memory.saveContext(
      {
        input:
          "Feeling disrespected that mona came to sleep with me despite me saying no",
      },
      { output: "" },
    );
    await memory.saveContext(
      { input: "Feeling guilty to have let Maria down yest. night" },
      { output: "" },
    );
    await memory.saveContext(
      {
        input:
          "Feeling guilty and sad when mam tell us we stay in touch bec. she will have difficulties when we leave matthieu’s home",
      },
      { output: "" },
    );
    await memory.saveContext(
      {
        input:
          "Feeling aroused and capable when playfight jamming with bastos caro and new ppl",
      },
      { output: "" },
    );
    await memory.saveContext(
      {
        input:
          "Feeling completely relaxed and epic at the end of movement course when lying down",
      },
      { output: "" },
    );
    await memory.saveContext(
      { input: "Feeling powerful when managing my money online" },
      { output: "" },
    );
    await memory.saveContext(
      {
        input:
          "Feeling like I am losing my time at the playfight workshop bec. I am not learning anything",
      },
      { output: "" },
    );
    await memory.saveContext(
      {
        input:
          "Feeling smart and useful when discussing with Thomas about his project and mine, bec. I felt less of a failure",
      },
      { output: "" },
    );
    await memory.saveContext(
      {
        input:
          "Feeling content and proud when theorizing about office locking and my chance bec. I like feeling different and free",
      },
      { output: "" },
    );
    await memory.saveContext(
      {
        input:
          "Feeling grateful to have the sun on my face while walking down from Montmarte bec. it felt warm and natural",
      },
      { output: "" },
    );
    await memory.saveContext(
      {
        input:
          "Feeling incapable to help mam when she tells me she’s not going well on phone call bec. hard to see loved ones struggle",
      },
      { output: "" },
    );
    // Now let's use the memory to retrieve the information we saved.
    // A text embedding is a vector that can measure the relatedness between text strings. Similar or relevant strings will be closer together than unrelated strings. This fact, along with the existence of fast vector search algorithms means that embeddings can be used to implement efficient knowledge retrieval. In particular, a text corpus can be split up into chunks, and each chunk can be embedded and stored. Then a given query can be embedded and vector search can be performed to find the embedded chunks of text from the corpus that are most related to the query (i.e. closest together in the embedding space).
    console.log(
      await memory.loadMemoryVariables({
        prompt:
          "Based on my personal experience what should I not eat before running?",
      }),
    );
    /*
{ loadedMoments: 'input: My favorite sport is soccer\noutput: ...' }
*/
    console.log(
      await memory.loadMemoryVariables({
        prompt: "What activity make me feel the best?",
      }),
    );
    // Now let's use it in a chain.
    const prompt =
      PromptTemplate.fromTemplate(`The following is a precise conversation between a human and an AI. If the AI does not know the answer to a question, it truthfully says it does not know. The AI answers should be brief and rely heavily of the provided relevant pieces of previous conversation.

Relevant pieces of previous conversation:
{loadedMoments}

Current conversation:
Human: {input}
AI:`);
    const chain2 = new LLMChain({ llm, prompt, memory });
    const res1 = await chain2.call({
      input:
        "Based on my previous experiences, is calling my mum the good thing to do when I am a bit down?",
    });
    console.log({ res1 });
    /*
    {
      res1: {
        text: " Hi Perry, I'm doing great! I'm currently exploring different topics related to artificial intelligence like natural language processing and machine learning. What about you? What have you been up to lately?"
      }
    }
    */

    const res2 = await chain2.call({
      input: "What is the likely first name of my girlfriend?",
    });
    console.log({ res2 });
    /*
    { res2: { text: ' You said your favorite sport is soccer.' } }
    */

    const res3 = await chain2.call({
      input:
        "Based on my previous experiences what should I not eat before running?",
    });
    console.log({ res3 });
    /*
    { res3: { text: ' Your name is Perry.' } }
    */

    res.send(res3);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while making the prediction");
  }
});

// // /api/chat/ route
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });

module.exports = router;
