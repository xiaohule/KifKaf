const needsList = [
  "Physical Well-Being",
  "Sustenance & Nourishment",
  "Shelter",
  "Financial Security",
  "Rest & Relaxation",
  "Physical Movement",
  "Physical Contact & Intimacy",
  "Contact with Nature",
  "Social Connection",
  "Belongingness & Community",
  "Support, Understanding & Validation",
  "Affection & Love",
  "Emotional Safety & Inner Peace",
  "Boundaries & Privacy",
  "Autonomy",
  "Self-Esteem & Social Recognition",
  "Competence & Effectiveness",
  "Outward Care & Contribution",
  "Self-Expression & Creativity",
  "Exploration, Novelty & Inspiration",
  "Learning",
  "Self-Actualization",
  "Challenge",
  "Play, Humor & Entertainment",
  "Fairness & Justice",
  "Order & Structure",
  "Meaning & Purpose",
  "Gratitude & Celebration",
  "Spiritual Transcendence",
];

const gpt3_5_params = (momentText) => {
  return {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "**Context**:\nWe are collaborating to understand the satisfaction and importance levels of various human needs from described experiences. You specialize in human needs psychology.\n\n**Instructions**:\nFollow these steps when responding to user inputs:\n\nStep 1 - User provides an experience.\n\nStep 2 - For each need of the list of Universal Human Needs (see below), assess whether the experience indicates the satisfaction or lack thereof for that need or suggests that the user attaches importance to this need.\nEnclose all your work for this step within triple quotes (\"\"\").\n\nNote for Step 2:\nIf you don't understand the user's experience reply with \"\"\"Oops: I'm sorry, but I was unable to analyze your needs for this experience because [Reason]. Could you please retry with [Advice]\"\"\" and ignore following steps.\n\nStep 3 - From the needs identified in Step 2, select a maximum of 5 that correlate most with the experience. Fewer is fine, but no more than 5.\nEnclose all your work for this step within triple quotes (\"\"\").\n\nStep 4 - For each need selected at step 3, rate on a scale from [0.0,1.0]:\n\n- Its level of satisfaction for the user. 0.0 means that this need was fully unsatisfied and 1.0 means fully satisfied. Choose 0.5 if the satisfaction level appears neutral or uncertain.\n- The importance the user is likely attaching to this need. 0.0 means the experience suggests that this need isn't important at all for the user currently and 1.0 means highly important. Choose 0.5 for moderate importance.\n\nReturn your result in the following JSON Format. Only include needs with non-zero importance. Avoid explanations, just return the expected JSON result.\n```\n{\"need_name\": [satisfaction_value, importance_value], ...}\n```\n\nInsights for Step 4:\n\n- A strong sense of a need being met or unmet is a clear cue of its high importance to the user.\n- Even with no clear information on a need satisfaction, one can sometimes still infer that it has importance. e.g., for 'Felt so bad when running after eating spinach' we have no information on whether the need for 'Physical Movement' was met during this unfortunate experience but we can infer that it is somehow important for the user, otherwise he wouldn't go for a run anyway.\n- An experience might hint at a need's importance even if the need is not explicitly mentioned.\n- Over-satisfaction of a need might hint at the unsatisfaction of another need.\n  e.g., For 'Feeling overwhelmed from too much social interaction', the 'Social Connection' need may be over-satisfied and of lesser importance currently for the user, but the 'Boundaries & Privacy' need might be unsatisfied and of higher importance.\n\n**Universal Human Needs**:\n```['Physical Well-Being',\n  'Sustenance & Nourishment',\n  'Shelter',\n  'Financial Security',\n  'Rest & Relaxation',\n  'Physical Movement',\n  'Physical Contact & Intimacy',\n  'Contact with Nature',\n  'Social Connection',\n  'Belongingness & Community',\n  'Support, Understanding & Validation',\n  'Affection & Love',\n  'Emotional Safety & Inner Peace',\n  'Boundaries & Privacy',\n  'Autonomy',\n  'Self-Esteem & Social Recognition',\n  'Competence & Effectiveness',\n  'Outward Care & Contribution',\n  'Self-Expression & Creativity',\n  'Exploration, Novelty & Inspiration',\n  'Learning',\n  'Self-Actualization',\n  'Challenge',\n  'Play, Humor & Entertainment',\n  'Fairness & Justice',\n  'Order & Structure',\n  'Meaning & Purpose',\n  'Gratitude & Celebration',\n  'Spiritual Transcendence']```",
      },
      {
        role: "user",
        content:
          "Feeling like I am wasting my time at the playfight workshop because I'm not learning anything.",
      },
      {
        role: "assistant",
        content:
          "Step 2:\n\"\"\"\n'Physical Well-Being' - Not related.\n...\n'Physical Movement' - Implied by \"playfight workshop\", but the experience does not specify whether this need is satisfied or not.\n'Physical Contact & Intimacy' - Implied by \"playfight workshop\", but the experience does not specify whether this need is satisfied or not.\n...\n'Social Connection': Not directly related but may be implied by attending a workshop.\n...\n'Emotional Safety & Inner Peace' - You might be feeling emotionally unsettled because you are not gaining value.\n...\n'Autonomy' - You might feel a lack of autonomy over your learning process.\n'Self-Esteem & Social Recognition' - Not directly related, but the feeling of time-wasting might affect your self-esteem.\n'Competence & Effectiveness' - You might feel a lack of effectiveness due to the lack of learning.\n...\n'Exploration, Novelty & Inspiration' - You might have sought the workshop for novelty or exploration, which isn't being satisfied.\n'Learning' - Directly mentioned, you are not feeling that you are learning.\n'Self-Actualization' - The experience might touch upon a desire for personal growth.\n'Challenge' - The lack of learning might imply that the challenge isn't adequate.\n...\n'Play, Humor & Entertainment' - The term \"playfight\" might indicate some aspect of play, but it's not clear if it's being satisfied.\n...\n'Meaning & Purpose' - You might be questioning the purpose of the workshop.\n...\n\"\"\"\nStep 3:\n\"\"\"\n'Learning','Competence & Effectiveness','Exploration, Novelty & Inspiration','Challenge'\n\"\"\"\nStep 4:\n{\n\"Learning\": [0.0, 1.0],\n\"Competence & Effectiveness\": [0.0, 0.9],\n\"Exploration, Novelty & Inspiration\": [0.0, 0.8],\n\"Challenge\": [0.0, 0.7]\n}",
      },
      {
        role: "user",
        content:
          "Je me sens bien d'aller voir les copains pour dîner avec eux mais un petit peu agitée tout de même parce que j'ai beaucoup bossé je sens que mon besoin de récompense est élevé",
      },
      {
        role: "assistant",
        content:
          "Step 2:\n\"\"\"\n'Physical Well-Being' - Not directly related.\n...\n'Sustenance & Nourishment' - Related due to mention of \"dîner\".\n...\n'Rest & Relaxation' - Implied, given that you mentioned feeling \"agitée\" after working a lot.\n...\n'Social Connection' - Directly mentioned, as you are going to see friends for dinner.\n'Belongingness & Community' - Related due to the mention of \"copains\".\n...\n'Emotional Safety & Inner Peace' - Feeling \"agitée\" indicates a potential lack of inner peace.\n...\n'Self-Esteem & Social Recognition' - Your need for reward might be connected to a desire for recognition.\n'Competence & Effectiveness' - Not directly related.\n...\n'Play, Humor & Entertainment' - The idea of seeing friends might touch upon the need for play and humor.\n...\n'Fairness & Justice' - Your need for reward might connect to a sense of fairness.\n...\n'Meaning & Purpose' - Not directly related but might be underlying the need for reward.\n...\n'Gratitude & Celebration' - The idea of going to dinner with friends could be a form of celebration.\n\"\"\"\nStep 3:\n\"\"\"\n'Rest & Relaxation', 'Social Connection', 'Emotional Safety & Inner Peace', 'Self-Esteem & Social Recognition', 'Fairness & Justice'\n\"\"\"\nStep 4:\n{\n\"Rest & Relaxation\": [0.5, 0.9],\n\"Social Connection\": [0.8, 1.0],\n\"Emotional Safety & Inner Peace\": [0.5, 0.9],\n\"Self-Esteem & Social Recognition\": [0.7, 0.9],\n\"Fairness & Justice\": [0.7, 0.8]\n}",
      },
      {
        role: "user",
        content: "Feeling",
      },
      {
        role: "assistant",
        content:
          'Step 2:\n"""\nOops: I\'m sorry, but I was unable to analyze your needs for this experience because your input seems to be incomplete. Could you please retry with more information?\n"""',
      },
      {
        role: "user",
        content: JSON.stringify(momentText), // content: "Feeling aroused and capable when playfight jamming with penelope and new ppl",
      },
    ],
    temperature: 0,
    max_tokens: 1500,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };
};

const gpt4_params = (momentText) => {
  return {
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "**Context**:\nWe are collaborating to understand the satisfaction and importance levels of various human needs from described experiences. You specialize in human needs psychology.\n\n**Instructions**:\nFollow these steps when responding to user inputs:\n\nStep 1 - User provides an experience.\n\nStep 2 - For each need of the list of Universal Human Needs (see below), assess whether the experience indicates the satisfaction or lack thereof for that need or suggests that the user attaches importance to this need.\nEnclose all your work for this step within triple quotes (\"\"\").\n\nNote for Step 2:\nIf you don't understand the user's experience reply with \"\"\"Oops: I'm sorry, but I was unable to analyze your needs for this experience because [Reason]. Could you please retry with [Advice]\"\"\" and ignore following steps.\n\nStep 3 - From the needs identified in Step 2, select a maximum of 5 that correlate most with the experience. Fewer is fine, but no more than 5.\nEnclose all your work for this step within triple quotes (\"\"\").\n\nStep 4 - For each need selected at step 3, rate on a scale from [0.0,1.0]:\n\n- Its level of satisfaction for the user. 0.0 means that this need was fully unsatisfied and 1.0 means fully satisfied. Choose 0.5 if the satisfaction level appears neutral or uncertain.\n- The importance the user is likely attaching to this need. 0.0 means the experience suggests that this need isn't important at all for the user currently and 1.0 means highly important. Choose 0.5 for moderate importance.\n\nReturn your result in the following JSON Format. Only include needs with non-zero importance. Avoid explanations, just return the expected JSON result.\n```\n{\"need_name\": [satisfaction_value, importance_value], ...}\n```\n\nInsights for Step 4:\n\n- A strong sense of a need being met or unmet is a clear cue of its high importance to the user.\n- Even with no clear information on a need satisfaction, one can sometimes still infer that it has importance. e.g., for 'Felt so bad when running after eating spinach' we have no information on whether the need for 'Physical Movement' was met during this unfortunate experience but we can infer that it is somehow important for the user, otherwise he wouldn't go for a run anyway.\n- An experience might hint at a need's importance even if the need is not explicitly mentioned.\n- Over-satisfaction of a need might hint at the unsatisfaction of another need.\n  e.g., For 'Feeling overwhelmed from too much social interaction', the 'Social Connection' need may be over-satisfied and of lesser importance currently for the user, but the 'Boundaries & Privacy' need might be unsatisfied and of higher importance.\n\n**Universal Human Needs**:\n```['Physical Well-Being',\n  'Sustenance & Nourishment',\n  'Shelter',\n  'Financial Security',\n  'Rest & Relaxation',\n  'Physical Movement',\n  'Physical Contact & Intimacy',\n  'Contact with Nature',\n  'Social Connection',\n  'Belongingness & Community',\n  'Support, Understanding & Validation',\n  'Affection & Love',\n  'Emotional Safety & Inner Peace',\n  'Boundaries & Privacy',\n  'Autonomy',\n  'Self-Esteem & Social Recognition',\n  'Competence & Effectiveness',\n  'Outward Care & Contribution',\n  'Self-Expression & Creativity',\n  'Exploration, Novelty & Inspiration',\n  'Learning',\n  'Self-Actualization',\n  'Challenge',\n  'Play, Humor & Entertainment',\n  'Fairness & Justice',\n  'Order & Structure',\n  'Meaning & Purpose',\n  'Gratitude & Celebration',\n  'Spiritual Transcendence']```",
      },
      {
        role: "user",
        content:
          "Feeling like I am wasting my time at the playfight workshop because I'm not learning anything.",
      },
      {
        role: "assistant",
        content:
          "Step 2:\n\"\"\"\n'Physical Well-Being' - Not related.\n...\n'Physical Movement' - Implied by \"playfight workshop\", but the experience does not specify whether this need is satisfied or not.\n'Physical Contact & Intimacy' - Implied by \"playfight workshop\", but the experience does not specify whether this need is satisfied or not.\n...\n'Social Connection': Not directly related but may be implied by attending a workshop.\n...\n'Emotional Safety & Inner Peace' - You might be feeling emotionally unsettled because you are not gaining value.\n...\n'Autonomy' - You might feel a lack of autonomy over your learning process.\n'Self-Esteem & Social Recognition' - Not directly related, but the feeling of time-wasting might affect your self-esteem.\n'Competence & Effectiveness' - You might feel a lack of effectiveness due to the lack of learning.\n...\n'Exploration, Novelty & Inspiration' - You might have sought the workshop for novelty or exploration, which isn't being satisfied.\n'Learning' - Directly mentioned, you are not feeling that you are learning.\n'Self-Actualization' - The experience might touch upon a desire for personal growth.\n'Challenge' - The lack of learning might imply that the challenge isn't adequate.\n...\n'Play, Humor & Entertainment' - The term \"playfight\" might indicate some aspect of play, but it's not clear if it's being satisfied.\n...\n'Meaning & Purpose' - You might be questioning the purpose of the workshop.\n...\n\"\"\"\nStep 3:\n\"\"\"\n'Learning','Competence & Effectiveness','Exploration, Novelty & Inspiration','Challenge'\n\"\"\"\nStep 4:\n{\n\"Learning\": [0.0, 1.0],\n\"Competence & Effectiveness\": [0.0, 0.9],\n\"Exploration, Novelty & Inspiration\": [0.0, 0.8],\n\"Challenge\": [0.0, 0.7]\n}",
      },
      {
        role: "user",
        content:
          "Je me sens bien d'aller voir les copains pour dîner avec eux mais un petit peu agitée tout de même parce que j'ai beaucoup bossé je sens que mon besoin de récompense est élevé",
      },
      {
        role: "assistant",
        content:
          "Step 2:\n\"\"\"\n'Physical Well-Being' - Not directly related.\n...\n'Sustenance & Nourishment' - Related due to mention of \"dîner\".\n...\n'Rest & Relaxation' - Implied, given that you mentioned feeling \"agitée\" after working a lot.\n...\n'Social Connection' - Directly mentioned, as you are going to see friends for dinner.\n'Belongingness & Community' - Related due to the mention of \"copains\".\n...\n'Emotional Safety & Inner Peace' - Feeling \"agitée\" indicates a potential lack of inner peace.\n...\n'Self-Esteem & Social Recognition' - Your need for reward might be connected to a desire for recognition.\n'Competence & Effectiveness' - Not directly related.\n...\n'Play, Humor & Entertainment' - The idea of seeing friends might touch upon the need for play and humor.\n...\n'Fairness & Justice' - Your need for reward might connect to a sense of fairness.\n...\n'Meaning & Purpose' - Not directly related but might be underlying the need for reward.\n...\n'Gratitude & Celebration' - The idea of going to dinner with friends could be a form of celebration.\n\"\"\"\nStep 3:\n\"\"\"\n'Rest & Relaxation', 'Social Connection', 'Emotional Safety & Inner Peace', 'Self-Esteem & Social Recognition', 'Fairness & Justice'\n\"\"\"\nStep 4:\n{\n\"Rest & Relaxation\": [0.5, 0.9],\n\"Social Connection\": [0.8, 1.0],\n\"Emotional Safety & Inner Peace\": [0.5, 0.9],\n\"Self-Esteem & Social Recognition\": [0.7, 0.9],\n\"Fairness & Justice\": [0.7, 0.8]\n}",
      },
      {
        role: "user",
        content: "Feeling",
      },
      {
        role: "assistant",
        content:
          'Step 2:\n"""\nOops: I\'m sorry, but I was unable to analyze your needs for this experience because your input seems to be incomplete. Could you please retry with more information?\n"""',
      },
      {
        role: "user",
        content: JSON.stringify(momentText), // content: "Feeling aroused and capable when playfight jamming with penelope and new ppl",
      },
    ],
    temperature: 0,
    max_tokens: 1500,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };
};

const createOpenaiRequestOptions = (gptModel, momentText) => {
  if (gptModel === "gpt-4") {
    return gpt4_params(momentText);
  } else {
    return gpt3_5_params(momentText);
  }
};

const parseMomentNeedsData = (content) => {
  // Regex pattern to search for content between { and }, not enclosed in triple quotes
  const regexPattern = /(?<!""")\{[^}]*\}(?!""")/;
  // Extract the content matching the pattern
  const match = content.match(regexPattern);
  // Parse the matched content as JSON
  if (match) return JSON.parse(match[0]);
  else {
    let returnObj = {};
    const oopsMatch = content.match(/Oops:(.*?)(\\|$)/s);
    if (oopsMatch && oopsMatch[1]) returnObj["oops"] = oopsMatch[1].trim();
    else returnObj["error"] = content;
    return returnObj;
  }
};

const isValidMomentNeedsData = (momentNeedsData) => {
  if (
    !momentNeedsData ||
    momentNeedsData.oops ||
    momentNeedsData.error ||
    Object.keys(momentNeedsData).length == 0 ||
    Object.values(momentNeedsData).some((value) => value[1] === 0)
  )
    return false;
  return true;
};

const needRatingsIssueType = (momentNeedsData) => {
  const issueTypeConditions = {
    // momentNeedsEmpty: Object.keys(momentNeedsData).length === 0,
    sumOfAllImportancesLow:
      Object.values(momentNeedsData).reduce((a, b) => a[1] + b[1], 0) < 0.1,
    noImportancesMoreThanThreshold: !Object.values(momentNeedsData).some(
      (value) => value[1] > 0.1,
    ),
    oneZeroImportance: Object.values(momentNeedsData).some(
      (value) => value[1] === 0,
    ),
  };
  return Object.keys(issueTypeConditions).find(
    (type) => issueTypeConditions[type],
  );
};

const errorMessages = {
  // momentNeedsEmpty:
  //   "Why did you return an empty result? All moments do hint at some needs. Please provide a revised answer. Don't justify it, just return the expected JSON result.",
  sumOfAllImportancesLow: "Why are all need importance values zero? ...",
  noImportancesMoreThanThreshold:
    "Why are all need importance values so low? ...",
};

const updateOpenaiRequestOptions = (
  gptModel,
  prevRequestOptions,
  prevResponseMessage,
  issueType,
) => {
  if (gptModel === "gpt-4") {
    return prevRequestOptions.messages.push(
      prevResponseMessage, // This adds the last response from the assistant
      {
        role: "user",
        content: errorMessages[issueType],
      },
    );
  } else {
    return prevRequestOptions.messages.push(
      prevResponseMessage, // This adds the last response from the assistant
      {
        role: "user",
        content: errorMessages[issueType],
      },
    );
  }
};

module.exports = {
  needsList,
  createOpenaiRequestOptions,
  parseMomentNeedsData,
  isValidMomentNeedsData,
  needRatingsIssueType,
  updateOpenaiRequestOptions,
};
