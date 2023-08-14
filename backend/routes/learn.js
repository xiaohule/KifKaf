var express = require("express");
var router = express.Router();
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

//TODO: 1 make prompt more inline?
router.get("/openai1", async (req, res) => {
  try {
    const request_options = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            '**Context**: You and I are collaborating as scientists trying to decipher the importance of different universal human needs held by individuals based on their described experiences. You are the top expert in the field of psychology concerning human needs.\n\n**Instructions**:\n1. You will be provided with descriptions of life experiences shared by an individual, termed "Moments". These moments will usually reflect the satisfaction or dissatisfaction of certain human needs.\n2. Rate the importance each need of the list of universal human needs (provided below) is likely holding for the individual based on that moment. Ratings should range from 0.0 (not important at all) to 1.0 (very important). 0.5 indicates moderate importance.\nNotes: Both the satisfaction and dissatisfaction of a need can indicate its importance.  Also, a moment might hint at a need\'s importance even if the need is not explicitly stated.\n3. Provide your result in a JSON format structured as shown in the example below, but only list needs with non-zero importance.\n\n**Universal Human Needs**:\n``` \n[\n  "Physical Safety 🛡️",\n  "Food 🥦",\n  "Shelter 🏠",\n  "Financial Security 💰",\n  "Rest & Relaxation 🌙",\n  "Comfort 🛋️",\n  "Physical Movement 🤸",\n  "Physical Touch 👐",\n  "Sexual Expression 💋",\n  "Contact with Nature 🏞️",\n  "Social Connection 👥",\n  "Belongingness & Community 🏘️",\n  "Empathy, Understanding & Validation 👂",\n  "Affection, Love & Intimacy ❤️",\n  "Emotional Safety & Well-Being 🤗",\n  "Personal Privacy 🚪",\n  "Personal Autonomy 🛤️",\n  "Self-Esteem & Social Recognition 💪",\n  "Competence 🏆",\n  "Efficiency ⚡",\n  "Societal Contribution 🔧",\n  "Personal Expression & Creativity 🎨",\n  "Exploration 🌎",\n  "Inspiration💡",\n  "Learning 📚",\n  "Self-Actualization 🌱",\n  "Challenge ⛰️",\n  "Novelty 🌀",\n  "Entertainment 🎠",\n  "Humor 😂",\n  "Play ⚽",\n  "Moral Integrity 🕊️",\n  "Social Justice ⚖️",\n  "Order & Structure 📐",\n  "Altruism 🤲",\n  "Life\'s Meaning & Purpose 🌌",\n  "Joyful Celebration 🎉",\n  "Grieving & Mourning 🥀",\n  "Inner Peace 🧘‍♂️",\n  "Spiritual Transcendence 🌸"\n]\n```\n\n**Expected JSON Format**:\n```\n [\n {"moment": "insert moment", "needs_importance": {"insert need":  insert need_importance,    ... }},\n ...\n]\n```\n\n**Example**:\nFor the Moment:\n```\n{\n  "moment": "Feeling like I am wasting my time at the playfight workshop because I\'m not learning anything"\n}\n```\nYou would assess for each need whether the moment is referring to the satisfaction or dissatisfaction of it, or if it somehow pertains to it.\n\nIt would go like:\n- "Physical Safety 🛡️": not related at all. need_importance: 0.0. \n... and so on ...\n- "Physical Movement 🤸": indirectly related since playfight is an activity involving movement so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. need_importance: 0.5.\n- "Physical Touch 👐": indirectly related since playfight is an activity involving touch so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. need_importance: 0.3.\n- "Sexual Expression 💋": indirectly related since playfight and sexual expression share a lot of traits like play, creativity, physical touch, etc... need_importance: 0.1. \n- "Social Connection 👥": indirectly related since playfight is an activity involving social connections so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. need_importance: 0.5.\n... and so on ...\n-  "Efficiency ⚡": directly related since the user is  reporting a high dissatisfaction caused by "not learning anything" so the user must have a high need for efficiency need_importance: 0.7.\n... and so on ...\n"Learning 📚": directly related since the user is  reporting a high dissatisfaction caused by "not learning anything" so the user must have a need for learning that is somewhat important. need_importance: 0.9\n... and so on ...\n\nResulting JSON (keeping only needs with a non-zero importance):\n```\n[\n  {\n    "moment": "Feeling like I am wasting my time at the playfight workshop because I\'m not learning anything",\n    "needs_importance": {\n      "Physical Movement 🤸": 0.5,\n      "Physical Touch 👐": 0.3,\n      "Sexual Expression 💋": 0.1,\n      "Social Connection 👥": 0.5,\n      "Belongingness & Community 🏘️": 0.1,\n      "Competence 🏆": 0.2,\n      "Efficiency ⚡": 0.7,\n      "Personal Autonomy 🛤️": 0.2,\n      "Personal Expression & Creativity 🎨": 0.3,\n      "Exploration 🌎": 0.3,\n      "Challenge ⛰️": 0.2,\n      "Novelty 🌀": 0.4,\n      "Play ⚽": 0.5,\n      "Self-Actualization 🌱": 0.2,\n      "Learning 📚": 0.9\n    }\n  }\n]\n```',
        },
        {
          role: "user",
          content:
            '[\n    {\n        "moment": "Felt so bad when running after eating spinach"\n    },\n    {\n        "moment": "Feeling excited when calling mum"\n    },\n    {\n        "moment": "Feeling both empty and full after movement class"\n    },\n    {\n        "moment": "Feeling so stressed out today when woking up"\n    },\n    {\n        "moment": "Feeling grateful toward life when eating my fresh tomatoes"\n    },\n    {\n        "moment": "Feeling a little down today after calling mum"\n    },\n    {\n        "moment": "Feeling proud of myself for working out today!"\n    },\n    {\n        "moment": "Feeling moody bec. of the grey weather"\n    },\n    {\n        "moment": "Sex with mona, good connection and sharing"\n    }\n]',
        },
      ],
      temperature: 0.25,
      max_tokens: 2304,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    const response = await openai.createChatCompletion(request_options);
    const contentJSON = response.data.choices[0].message.content;
    // Parse the content to a JavaScript object
    const parsedContent = JSON.parse(contentJSON);
    console.log(parsedContent);
    /*
    [
      {
        moment: 'Felt so bad when running after eating spinach',
        needs_importance: { 'Food 🥦': 0.8, 'Physical Movement 🤸': 0.9 }
      }, ...
    ]
     */
    res.json(parsedContent[0].needs_importance);

    // console.log("OpenAI API Response:", JSON.stringify(response, null, 2));
    // const fs = require("fs");
    // fs.writeFileSync(
    //   "/Users/julesdouet/web-projects/quasar-project/src/assets/consoleOutputData.txt",
    //   safeStringify(response.data)
    // );
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while making the prediction");
  }
});

router.get("/openai1_2", async (req, res) => {
  try {
    const request_options = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            '**Context**: You and I are collaborating as scientists trying to decipher the importance of different universal human needs held by individuals based on their described experiences. You are the top expert in the field of psychology concerning human needs.\n\n**Instructions**:\n1. You will be provided with descriptions of life experiences shared by an individual, termed "Moments". These moments will usually reflect the satisfaction or dissatisfaction of certain human needs.\n2. Rate the importance each need of the list of universal human needs (provided below) is likely holding for the individual based on that moment. Ratings should range from 0.0 (not important at all) to 1.0 (very important). 0.5 indicates moderate importance.\nNotes: Both the satisfaction and dissatisfaction of a need can indicate its importance.  Also, a moment might hint at a need\'s importance even if the need is not explicitly stated.\n3. Provide your result in a JSON format structured as shown in the example below, but only list needs with non-zero importance.\n\n**Universal Human Needs**:\n```["Physical Safety 🛡️","Food 🥦","Shelter 🏠","Financial Security 💰","Rest & Relaxation 🌙","Comfort 🛋️","Physical Movement 🤸","Physical Touch 👐","Sexual Expression 💋","Contact with Nature 🏞️","Social Connection 👥","Belongingness & Community 🏘️","Empathy, Understanding & Validation 👂","Affection, Love & Intimacy ❤️","Emotional Safety & Well-Being 🤗","Personal Privacy 🚪","Personal Autonomy 🛤️","Self-Esteem & Social Recognition 💪","Competence 🏆","Efficiency ⚡","Societal Contribution 🔧","Personal Expression & Creativity 🎨","Exploration 🌎","Inspiration💡","Learning 📚","Self-Actualization 🌱","Challenge ⛰️","Novelty 🌀","Entertainment 🎠","Humor 😂","Play ⚽","Moral Integrity 🕊️","Social Justice ⚖️","Order & Structure 📐","Altruism 🤲","Life\'s Meaning & Purpose 🌌","Joyful Celebration 🎉","Grieving & Mourning 🥀","Inner Peace 🧘‍♂️","Spiritual Transcendence 🌸"]```\n\n**Expected JSON Format**:\n```[{"moment":"insert moment", "needs_importance": {"insert need":insert need_importance,... }}, ...]```\n\n**Example**:\nFor the Moment:\n```{"moment": "Feeling like I am wasting my time at the playfight workshop because I\'m not learning anything"}```\nYou would assess for each need whether the moment is referring to the satisfaction or dissatisfaction of it, or if it somehow pertains to it.\n\nIt would go like:\n- "Physical Safety 🛡️": not related at all. need_importance: 0.0. \n... and so on ...\n- "Physical Movement 🤸": indirectly related since playfight is an activity involving movement so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. need_importance: 0.5.\n- "Physical Touch 👐": indirectly related since playfight is an activity involving touch so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. need_importance: 0.3.\n- "Sexual Expression 💋": indirectly related since playfight and sexual expression share a lot of traits like play, creativity, physical touch, etc... need_importance: 0.1. \n- "Social Connection 👥": indirectly related since playfight is an activity involving social connections so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. need_importance: 0.5.\n... and so on ...\n-  "Efficiency ⚡": directly related since the user is  reporting a high dissatisfaction caused by "not learning anything" so the user must have a high need for efficiency need_importance: 0.7.\n... and so on ...\n"Learning 📚": directly related since the user is  reporting a high dissatisfaction caused by "not learning anything" so the user must have a need for learning that is somewhat important. need_importance: 0.9\n... and so on ...\n\nResulting JSON (keeping only needs with a non-zero importance):\n```[  {"moment": "Feeling like I am wasting my time at the playfight workshop because I\'m not learning anything","needs_importance": {"Physical Movement 🤸": 0.5,"Physical Touch 👐": 0.3,"Sexual Expression 💋": 0.1,"Social Connection 👥": 0.5,"Belongingness & Community 🏘️": 0.1,"Competence 🏆": 0.2,"Efficiency ⚡": 0.7,"Personal Autonomy 🛤️": 0.2,"Personal Expression & Creativity 🎨": 0.3,"Exploration 🌎": 0.3,"Challenge ⛰️": 0.2,"Novelty 🌀": 0.4,"Play ⚽": 0.5,"Self-Actualization 🌱": 0.2,"Learning 📚": 0.9}  }]\n```',
        },
        {
          role: "user",
          content:
            '[\n    {\n        "moment": "Felt so bad when running after eating spinach"\n    },\n    {\n        "moment": "Feeling excited when calling mum"\n    },\n    {\n        "moment": "Feeling both empty and full after movement class"\n    },\n    {\n        "moment": "Feeling so stressed out today when woking up"\n    },\n    {\n        "moment": "Feeling grateful toward life when eating my fresh tomatoes"\n    },\n    {\n        "moment": "Feeling a little down today after calling mum"\n    },\n    {\n        "moment": "Feeling proud of myself for working out today!"\n    },\n    {\n        "moment": "Feeling moody bec. of the grey weather"\n    },\n    {\n        "moment": "Sex with mona, good connection and sharing"\n    }\n]',
        },
      ],
      temperature: 0.25,
      max_tokens: 2304,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    const response = await openai.createChatCompletion(request_options);
    const contentJSON = response.data.choices[0].message.content;
    // Parse the content to a JavaScript object
    const parsedContent = JSON.parse(contentJSON);
    console.log(parsedContent);
    /*
    [
      {
        moment: 'Felt so bad when running after eating spinach',
        needs_importance: { 'Food 🥦': 0.8, 'Physical Movement 🤸': 0.9 }
      }, ...
    ]
     */
    res.json(parsedContent[0].needs_importance);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while making the prediction");
  }
});

router.get("/openai1_no_emoji", async (req, res) => {
  try {
    const request_options = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            '**Context**: You and I are collaborating as scientists trying to decipher the importance of different universal human needs held by individuals based on their described experiences. You are the top expert in the field of psychology concerning human needs.\n\n**Instructions**:\n1. You will be provided with descriptions of life experiences shared by an individual, termed "Moments". These moments will usually reflect the satisfaction or dissatisfaction of certain human needs.\n2. Rate the importance each need of the list of universal human needs (provided below) is likely holding for the individual based on that moment. Ratings should range from 0.0 (not important at all) to 1.0 (very important). 0.5 indicates moderate importance.\nNotes: Both the satisfaction and dissatisfaction of a need can indicate its importance.  Also, a moment might hint at a need\'s importance even if the need is not explicitly stated.\n3. Provide your result in a JSON format structured as shown in the example below, but only list needs with non-zero importance.\n\n**Universal Human Needs**:\n```[ "Physical Safety", "Food", "Shelter", "Financial Security", "Rest & Relaxation", "Comfort", "Physical Movement", "Physical Touch", "Sexual Expression", "Contact with Nature", "Social Connection", "Belongingness & Community", "Empathy, Understanding & Validation", "Affection, Love & Intimacy", "Emotional Safety & Well-Being", "Personal Privacy", "Personal Autonomy", "Self-Esteem & Social Recognition", "Competence", "Efficiency", "Societal Contribution", "Personal Expression & Creativity", "Exploration", "Inspiration", "Learning", "Self-Actualization", "Challenge", "Novelty", "Entertainment", "Humor", "Play", "Moral Integrity", "Social Justice", "Order & Structure", "Altruism", "Life\'s Meaning & Purpose", "Joyful Celebration", "Grieving & Mourning", "Inner Peace", "Spiritual Transcendence" ]```\n\n**Expected JSON Format**:\n```\n [\n {"moment": "insert moment", "needs_importance": {"insert need":  insert need_importance,    ... }},\n ...\n]\n```\n\n**Example**:\nFor the Moment:\n```\n{\n  "moment": "Feeling like I am wasting my time at the playfight workshop because I\'m not learning anything"\n}\n```\nYou would assess for each need whether the moment is referring to the satisfaction or dissatisfaction of it, or if it somehow pertains to it.\n\nIt would go like:\n- "Physical Safety": not related at all. need_importance: 0.0. \n... and so on ...\n- "Physical Movement": indirectly related since playfight is an activity involving movement so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. need_importance: 0.5.\n- "Physical Touch": indirectly related since playfight is an activity involving touch so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. need_importance: 0.3.\n- "Sexual Expression": indirectly related since playfight and sexual expression share a lot of traits like play, creativity, physical touch, etc... need_importance: 0.1. \n- "Social Connection": indirectly related since playfight is an activity involving social connections so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. need_importance: 0.5.\n... and so on ...\n-  "Efficiency ⚡": directly related since the user is  reporting a high dissatisfaction caused by "not learning anything" so the user must have a high need for efficiency need_importance: 0.7.\n... and so on ...\n"Learning": directly related since the user is  reporting a high dissatisfaction caused by "not learning anything" so the user must have a need for learning that is somewhat important. need_importance: 0.9\n... and so on ...\n\nResulting JSON (keeping only needs with a non-zero importance):\n```\n[\n  {\n    "moment": "Feeling like I am wasting my time at the playfight workshop because I\'m not learning anything",\n    "needs_importance": {\n      "Physical Movement": 0.5,\n      "Physical Touch": 0.3,\n      "Sexual Expression": 0.1,\n      "Social Connection": 0.5,\n      "Belongingness & Community": 0.1,\n      "Competence": 0.2,\n      "Efficiency": 0.7,\n      "Personal Autonomy": 0.2,\n      "Personal Expression & Creativity": 0.3,\n      "Exploration": 0.3,\n      "Challenge": 0.2,\n      "Novelty": 0.4,\n      "Play": 0.5,\n      "Self-Actualization": 0.2,\n      "Learning": 0.9\n    }\n  }\n]\n```',
        },
        {
          role: "user",
          content:
            '[\n    {\n        "moment": "Felt so bad when running after eating spinach"\n    },\n    {\n        "moment": "Feeling excited when calling mum"\n    },\n    {\n        "moment": "Feeling both empty and full after movement class"\n    },\n    {\n        "moment": "Feeling so stressed out today when woking up"\n    },\n    {\n        "moment": "Feeling grateful toward life when eating my fresh tomatoes"\n    },\n    {\n        "moment": "Feeling a little down today after calling mum"\n    },\n    {\n        "moment": "Feeling proud of myself for working out today!"\n    },\n    {\n        "moment": "Feeling moody bec. of the grey weather"\n    },\n    {\n        "moment": "Sex with mona, good connection and sharing"\n    }\n]',
        },
      ],
      temperature: 0.25,
      max_tokens: 2304,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    const response = await openai.createChatCompletion(request_options);
    const contentJSON = response.data.choices[0].message.content;
    // Parse the content to a JavaScript object
    const parsedContent = JSON.parse(contentJSON);
    console.log(parsedContent);
    /*
    [
      {
        moment: 'Felt so bad when running after eating spinach',
        needs_importance: { 'Food 🥦': 0.8, 'Physical Movement 🤸': 0.9 }
      }, ...
    ]
     */
    res.json(parsedContent[0].needs_importance);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while making the prediction");
  }
});

router.get("/openai2", async (req, res) => {
  try {
    const request_options = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            '**Context**: You and I are collaborating as scientists trying to decipher the importance of different universal human needs held by individuals based on their described experiences. You are the top expert in the field of psychology concerning human needs.\n\n**Instructions**:\n1. You will be provided with descriptions of life experiences shared by an individual, termed "Moments". These moments will usually reflect the satisfaction or dissatisfaction of certain human needs.\n2. Rate the importance each need of the list of universal human needs (provided below) is likely holding for the individual based on that moment. Ratings should range from 0.0 (not important at all) to 1.0 (very important). 0.5 indicates moderate importance.\nNotes: Both the satisfaction and dissatisfaction of a need can indicate its importance.  Also, a moment might hint at a need\'s importance even if the need is not explicitly stated.\n3. Provide your result in a JSON format structured as shown in the example below, but only list needs with non-zero importance.\n\n**Universal Human Needs**:\n``` \n[\n  "Physical Safety 🛡️",\n  "Food 🥦",\n  "Shelter 🏠",\n  "Financial Security 💰",\n  "Rest & Relaxation 🌙",\n  "Comfort 🛋️",\n  "Physical Movement 🤸",\n  "Physical Touch 👐",\n  "Sexual Expression 💋",\n  "Contact with Nature 🏞️",\n  "Social Connection 👥",\n  "Belongingness & Community 🏘️",\n  "Empathy, Understanding & Validation 👂",\n  "Affection, Love & Intimacy ❤️",\n  "Emotional Safety & Well-Being 🤗",\n  "Personal Privacy 🚪",\n  "Personal Autonomy 🛤️",\n  "Self-Esteem & Social Recognition 💪",\n  "Competence 🏆",\n  "Efficiency ⚡",\n  "Societal Contribution 🔧",\n  "Personal Expression & Creativity 🎨",\n  "Exploration 🌎",\n  "Inspiration💡",\n  "Learning 📚",\n  "Self-Actualization 🌱",\n  "Challenge ⛰️",\n  "Novelty 🌀",\n  "Entertainment 🎠",\n  "Humor 😂",\n  "Play ⚽",\n  "Moral Integrity 🕊️",\n  "Social Justice ⚖️",\n  "Order & Structure 📐",\n  "Altruism 🤲",\n  "Life\'s Meaning & Purpose 🌌",\n  "Joyful Celebration 🎉",\n  "Grieving & Mourning 🥀",\n  "Inner Peace 🧘‍♂️",\n  "Spiritual Transcendence 🌸"\n]\n```\n\n**Expected JSON Format**:\n```\n [\n {"moment": "insert moment", "needs_importance": {"insert need":  insert need_importance,    ... }},\n ...\n]\n```\n\n**Example**:\nFor the Moment:\n```\n{\n  "moment": "Feeling like I am wasting my time at the playfight workshop because I\'m not learning anything"\n}\n```\nYou would assess for each need whether the moment is referring to the satisfaction or dissatisfaction of it, or if it somehow pertains to it.\n\nIt would go like:\n- "Physical Safety 🛡️": not related at all. need_importance: 0.0. \n... and so on ...\n- "Physical Movement 🤸": indirectly related since playfight is an activity involving movement so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. need_importance: 0.5.\n- "Physical Touch 👐": indirectly related since playfight is an activity involving touch so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. need_importance: 0.3.\n- "Sexual Expression 💋": indirectly related since playfight and sexual expression share a lot of traits like play, creativity, physical touch, etc... need_importance: 0.1. \n- "Social Connection 👥": indirectly related since playfight is an activity involving social connections so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. need_importance: 0.5.\n... and so on ...\n-  "Efficiency ⚡": directly related since the user is  reporting a high dissatisfaction caused by "not learning anything" so the user must have a high need for efficiency need_importance: 0.7.\n... and so on ...\n"Learning 📚": directly related since the user is  reporting a high dissatisfaction caused by "not learning anything" so the user must have a need for learning that is somewhat important. need_importance: 0.9\n... and so on ...\n\nResulting JSON (keeping only needs with a non-zero importance):\n```\n[\n  {\n    "moment": "Feeling like I am wasting my time at the playfight workshop because I\'m not learning anything",\n    "needs_importance": {\n      "Physical Movement 🤸": 0.5,\n      "Physical Touch 👐": 0.3,\n      "Sexual Expression 💋": 0.1,\n      "Social Connection 👥": 0.5,\n      "Belongingness & Community 🏘️": 0.1,\n      "Competence 🏆": 0.2,\n      "Efficiency ⚡": 0.7,\n      "Personal Autonomy 🛤️": 0.2,\n      "Personal Expression & Creativity 🎨": 0.3,\n      "Exploration 🌎": 0.3,\n      "Challenge ⛰️": 0.2,\n      "Novelty 🌀": 0.4,\n      "Play ⚽": 0.5,\n      "Self-Actualization 🌱": 0.2,\n      "Learning 📚": 0.9\n    }\n  }\n]\n```',
        },
        {
          role: "user",
          content:
            '[\n  {\n    "moment": "Feeling aroused and capable when playfight jamming with penelope and new ppl"\n  }\n]',
        },
      ],
      temperature: 0.25,
      max_tokens: 2304,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    const response = await openai.createChatCompletion(request_options);
    const contentJSON = response.data.choices[0].message.content;
    // Parse the content to a JavaScript object
    const parsedContent = JSON.parse(contentJSON);
    console.log(parsedContent);
    /*
    [
      {
        moment: 'Felt so bad when running after eating spinach',
        needs_importance: { 'Food 🥦': 0.8, 'Physical Movement 🤸': 0.9 }
      }, ...
    ]
     */
    res.json(parsedContent[0].needs_importance);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while making the prediction");
  }
});

router.get("/openai2_no_emoji", async (req, res) => {
  try {
    const request_options = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            '**Context**: You and I are collaborating as scientists trying to decipher the importance of different universal human needs held by individuals based on their described experiences. You are the top expert in the field of psychology concerning human needs.\n\n**Instructions**:\n1. You will be provided with descriptions of life experiences shared by an individual, termed "Moments". These moments will usually reflect the satisfaction or dissatisfaction of certain human needs.\n2. Rate the importance each need of the list of universal human needs (provided below) is likely holding for the individual based on that moment. Ratings should range from 0.0 (not important at all) to 1.0 (very important). 0.5 indicates moderate importance.\nNotes: Both the satisfaction and dissatisfaction of a need can indicate its importance.  Also, a moment might hint at a need\'s importance even if the need is not explicitly stated.\n3. Provide your result in a JSON format structured as shown in the example below, but only list needs with non-zero importance.\n\n**Universal Human Needs**:\n``` \n[ "Physical Safety", "Food", "Shelter", "Financial Security", "Rest & Relaxation", "Comfort", "Physical Movement", "Physical Touch", "Sexual Expression", "Contact with Nature", "Social Connection", "Belongingness & Community", "Empathy, Understanding & Validation", "Affection, Love & Intimacy", "Emotional Safety & Well-Being", "Personal Privacy", "Personal Autonomy", "Self-Esteem & Social Recognition", "Competence", "Efficiency", "Societal Contribution", "Personal Expression & Creativity", "Exploration", "Inspiration", "Learning", "Self-Actualization", "Challenge", "Novelty", "Entertainment", "Humor", "Play", "Moral Integrity", "Social Justice", "Order & Structure", "Altruism", "Life\'s Meaning & Purpose", "Joyful Celebration", "Grieving & Mourning", "Inner Peace", "Spiritual Transcendence" ]\n```\n\n**Expected JSON Format**:\n```\n [{"moment": "insert moment", "needs_importance": {"insert need":  insert need_importance, ... }}, ... ]\n```\n\n**Example**:\nFor the Moment:\n```\n{"moment": "Feeling like I am wasting my time at the playfight workshop because I\'m not learning anything"}\n```\nYou would assess for each need whether the moment is referring to the satisfaction or dissatisfaction of it, or if it somehow pertains to it.\nIt would go like:\n- "Physical Safety": not related at all. need_importance: 0.0. \n...\n- "Physical Movement": indirectly related since playfight is an activity involving movement so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. need_importance: 0.5.\n- "Physical Touch": indirectly related since playfight is an activity involving touch so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. need_importance: 0.3.\n- "Sexual Expression": indirectly related since playfight and sexual expression share a lot of traits like play, creativity, physical touch, etc... need_importance: 0.1. \n- "Social Connection": indirectly related since playfight is an activity involving social connections so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. need_importance: 0.5.\n...\n-  "Efficiency": directly related since the user is  reporting a high dissatisfaction caused by "not learning anything" so the user must have a high need for efficiency need_importance: 0.7.\n...\n"Learning": directly related since the user is  reporting a high dissatisfaction caused by "not learning anything" so the user must have a need for learning that is somewhat important. need_importance: 0.9\n...\n\nResulting JSON (keeping only needs with a non-zero importance):\n```\n[ { "moment": "Feeling like I am wasting my time at the playfight workshop because I\'m not learning anything", "needs_importance": { "Physical Movement": 0.5, "Physical Touch": 0.3, "Sexual Expression": 0.1, "Social Connection": 0.5, "Belongingness & Community": 0.1, "Personal Autonomy": 0.2, "Competence": 0.2, "Efficiency": 0.7, "Personal Expression & Creativity": 0.3, "Exploration": 0.3, "Challenge": 0.2, "Novelty": 0.4, "Learning": 0.9, "Self-Actualization": 0.2, "Play": 0.5 } } ]\n```',
        },
        {
          role: "user",
          content:
            '[{"moment": "Feeling aroused and capable when playfight jamming with penelope and new ppl"}]',
        },
      ],
      temperature: 0.25,
      max_tokens: 2304,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    const response = await openai.createChatCompletion(request_options);
    const contentJSON = response.data.choices[0].message.content;
    // Parse the content to a JavaScript object
    const parsedContent = JSON.parse(contentJSON);
    console.log(parsedContent);
    /*
    [
      {
        moment: 'Felt so bad when running after eating spinach',
        needs_importance: { 'Food 🥦': 0.8, 'Physical Movement 🤸': 0.9 }
      }, ...
    ]
     */
    res.json(parsedContent[0].needs_importance);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while making the prediction");
  }
});

//route to test performance
router.get("/dummy", async (req, res) => {
  try {
    res.json("Dummy response");
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while making the prediction");
  }
});

module.exports = router;
