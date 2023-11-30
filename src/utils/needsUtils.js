// src/utils/needsUtils.js
export const needsMap = {
  //add 'Work-Life Balance'?
  "Physical Well-Being": [
    "🛡️",
    "Physiological & Safety",
    "physical-well-being",
  ], //readd Physical safety dedans ou split
  "Sustenance & Nourishment": [
    "🍎",
    "Physiological & Safety",
    "sustenance-and-nourishment",
  ],
  Shelter: ["🏠", "Physiological & Safety", "shelter"],
  "Financial Security": ["💰", "Physiological & Safety", "financial-security"],
  "Rest & Relaxation": ["🌙", "Physiological & Safety", "rest-and-relaxation"], //🛋️ //🛌
  "Physical Movement": ["🤸", "Physiological & Safety", "physical-movement"],
  "Emotional Safety & Inner Peace": [
    "🧘",
    "Physiological & Safety",
    "emotional-safety-and-inner-peace",
  ], //"🤗","", ""],
  "Boundaries & Privacy": [
    "🚪",
    "Physiological & Safety",
    "boundaries-and-privacy",
  ],
  "Physical Contact & Intimacy": [
    "👐",
    "Connection",
    "physical-contact-and-intimacy",
  ],
  "Contact with Nature": ["🏞️", "Connection", "contact-with-nature"],
  "Social Connection": ["👥", "Connection", "social-connection"],
  "Belongingness & Community": [
    "🏘️",
    "Connection",
    "belongingness-and-community",
  ],
  "Support, Understanding & Validation": [
    "👂",
    "Connection",
    "support-understanding-and-validation",
  ], // séparer "Support from Understanding & Validation"? OU réduire à Support & Understanding?
  "Affection & Love": ["❤️", "Connection", "affection-and-love"],
  "Play, Humor & Entertainment": [
    "🎠",
    "Connection",
    "play-humor-and-entertainment",
  ], // "😂",""],"⚽",""],🎭
  Autonomy: ["🛤️", "Esteem", "autonomy"],
  "Self-Esteem & Social Recognition": [
    "💪",
    "Esteem",
    "self-esteem-and-social-recognition",
  ],
  "Competence & Effectiveness": [
    "🎯",
    "Esteem",
    "competence-and-effectiveness",
  ],
  "Self-Expression & Creativity": [
    "🎨",
    "Esteem",
    "self-expression-and-creativity",
  ],
  "Exploration, Novelty & Inspiration": [
    "🌌",
    "Personal Growth",
    "exploration-novelty-and-inspiration",
  ], //🌎 // réduire à Exploration & Novelty?
  Learning: ["📚", "Personal Growth", "learning"],
  "Self-Actualization": ["🌱", "Personal Growth", "self-actualization"], //merge learning and self-actualization?
  Challenge: ["⛰️", "Personal Growth", "challenge"],
  "Outward Care & Contribution": [
    "🤲",
    "Meaning & Transcendence",
    "outward-care-and-contribution",
  ], //break in 2?
  "Fairness & Justice": [
    "⚖️",
    "Meaning & Transcendence",
    "fairness-and-justice",
  ], //🕊️
  "Order & Structure": ["📐", "Meaning & Transcendence", "order-and-structure"],
  "Meaning & Purpose": ["🧭", "Meaning & Transcendence", "meaning-and-purpose"], //🌌
  "Gratitude & Celebration": [
    "🎈",
    "Meaning & Transcendence",
    "gratitude-and-celebration",
  ], //🎉 //🕯️
  "Spiritual Transcendence": [
    "🌸",
    "Meaning & Transcendence",
    "spiritual-transcendence",
  ],
};

export const needsCategories = {
  "Physiological & Safety": ["health_and_safety", "soft-green-need"],
  Connection: ["diversity_2", "warm-coral-need"], //groups
  Esteem: ["palette", "muted-blue-need"],
  "Personal Growth": ["landscape", "lavender-need"], //explore
  "Meaning & Transcendence": ["spa", "serene-teal-need"],
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
