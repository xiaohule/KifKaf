// src/utils/needsUtils.js
export const needsMap = {
  //add 'Work-Life Balance'?
  "Physical Well-Being": [
    "🛡️",
    "physiologicalAndSafety",
    "physical-well-being",
  ], //readd Physical safety dedans ou split
  "Sustenance & Nourishment": [
    "🍎",
    "physiologicalAndSafety",
    "sustenance-and-nourishment",
  ],
  Shelter: ["🏠", "physiologicalAndSafety", "shelter"],
  "Financial Security": ["💰", "physiologicalAndSafety", "financial-security"],
  "Rest & Relaxation": ["🌙", "physiologicalAndSafety", "rest-and-relaxation"], //🛋️ //🛌
  "Physical Movement": ["🤸", "physiologicalAndSafety", "physical-movement"],
  "Emotional Safety & Inner Peace": [
    "🧘",
    "physiologicalAndSafety",
    "emotional-safety-and-inner-peace",
  ], //"🤗","", ""],
  "Boundaries & Privacy": [
    "🚪",
    "physiologicalAndSafety",
    "boundaries-and-privacy",
  ],
  "Physical Contact & Intimacy": [
    "👐",
    "connection",
    "physical-contact-and-intimacy",
  ],
  "Contact with Nature": ["🏞️", "connection", "contact-with-nature"],
  "Social Connection": ["👥", "connection", "social-connection"],
  "Belongingness & Community": [
    "🏘️",
    "connection",
    "belongingness-and-community",
  ],
  "Support, Understanding & Validation": [
    "👂",
    "connection",
    "support-understanding-and-validation",
  ], // séparer "Support from Understanding & Validation"? OU réduire à Support & Understanding?
  "Affection & Love": ["❤️", "connection", "affection-and-love"],
  "Play, Humor & Entertainment": [
    "🎠",
    "connection",
    "play-humor-and-entertainment",
  ], // "😂",""],"⚽",""],🎭
  Autonomy: ["🛤️", "esteem", "autonomy"],
  "Self-Esteem & Social Recognition": [
    "💪",
    "esteem",
    "self-esteem-and-social-recognition",
  ],
  "Competence & Effectiveness": [
    "🎯",
    "esteem",
    "competence-and-effectiveness",
  ],
  "Self-Expression & Creativity": [
    "🎨",
    "esteem",
    "self-expression-and-creativity",
  ],
  "Exploration, Novelty & Inspiration": [
    "🌌",
    "personalGrowth",
    "exploration-novelty-and-inspiration",
  ], //🌎 // réduire à Exploration & Novelty?
  Learning: ["📚", "personalGrowth", "learning"],
  "Self-Actualization": ["🌱", "personalGrowth", "self-actualization"], //merge learning and self-actualization?
  Challenge: ["⛰️", "personalGrowth", "challenge"],
  "Outward Care & Contribution": [
    "🤲",
    "meaningAndTranscendence",
    "outward-care-and-contribution",
  ], //break in 2?
  "Fairness & Justice": [
    "⚖️",
    "meaningAndTranscendence",
    "fairness-and-justice",
  ], //🕊️
  "Order & Structure": ["📐", "meaningAndTranscendence", "order-and-structure"],
  "Meaning & Purpose": ["🧭", "meaningAndTranscendence", "meaning-and-purpose"], //🌌
  "Gratitude & Celebration": [
    "🎈",
    "meaningAndTranscendence",
    "gratitude-and-celebration",
  ], //🎉 //🕯️
  "Spiritual Transcendence": [
    "🌸",
    "meaningAndTranscendence",
    "spiritual-transcendence",
  ],
};

export const needsCategories = {
  physiologicalAndSafety: ["health_and_safety", "soft-green-need"],
  connection: ["diversity_2", "warm-coral-need"], //groups
  esteem: ["palette", "muted-blue-need"],
  personalGrowth: ["landscape", "lavender-need"], //explore
  meaningAndTranscendence: ["spa", "serene-teal-need"],
};

// Utility function to convert need slug to string
export const needSlugToStr = (slug) => {
  // Iterate over the keys of the needsMap
  for (const [key, value] of Object.entries(needsMap)) {
    // Check if the slug matches the third element in the array
    if (value[2] === slug) {
      return key; // Return the corresponding need name
    }
  }
  return null;
};

// Computed property to map needs to their colors
export const needToColor = () => {
  const map = {};
  for (const need in needsMap) {
    const category = needsMap[need][1];
    const color = needsCategories[category][1];
    map[need] = color;
  }
  return map;
};

export const getChipColor = (needsStats) => {
  const difference = needsStats.satisfaction - needsStats.dissatisfaction;
  if (difference > 0.2) return "positive";
  else if (difference < -0.2) return "negative";
  else return "primary";
};
