import privacyPolicyPage from "./privacyPolicy";
import tosPage from "./tos";

export default {
  privacyPolicyPage,
  tosPage,
  filepaths: {
    screenshot1: "screenshot1_en.webp",
    screenshot2: "screenshot2_en.webp",
    screenshot3: "screenshot3_en.webp",
    screenshot4: "screenshot4_en.webp",
    screenshot5: "screenshot5_en.webp",
  },
  welcomeToKifkaf: "Welcome to KifKaf",
  kifkaf: "KifKaf",
  valuePropHtml:
    "Understand what <b><i>you</i></b> need for a more fulfilled life.",
  next: "Next",
  privacyFirst: "Privacy first",
  privacyFirstText:
    "KifKaf is only about you and your happiness.<br>It is designed to be secure and private.<br>It will remain ad-free and we will never monetize your data.",
  // Your journal is designed to be secure and private. Only you can read it.",
  iAgreeToThe: "I agree to the",
  andThe: "and the",
  whatsOnYourMind: "What's on your mind?",
  maybeLater: "Maybe later",
  iWantTo: "I want to...",
  yourChoicesWont:
    "Your choices won't limit access to any features of the app.",
  whatDoYouHope: "What do you hope to improve with KifKaf?",
  beMoreFulFilled: "Be more fulfilled",
  understandMyNeeds: "Understand and attend to my needs",
  improveRelationships: "Improve my relationships",
  manageEmotions: "Manage my emotions better",
  keepTrackEmotions: "Keep track of my emotions",
  makeWiserLifeDecisions: "Make wiser life decisions",
  somethingElse: "Something else",
  getRemindersToMake: "Get reminders to make the most out of KifKaf",
  journalingNotif: "Journaling",
  journalingNotifText:
    "When will you make time for jotting down the day's ups and downs?",
  insightsNotif: "Insights",
  insightsNotifText:
    "Receive a notification when new insights about your journal are ready.",
  login: "Log in",
  loginToKifKaf: "Log in to KifKaf",
  continueWithGoogle: "Continue with Google",
  continueWithApple: "Continue with Apple",
  continueWithEmail: "Continue with email",
  continue: "Continue",
  byContinuingText: "By continuing, you agree to KifKaf's",
  whatShouldWeCallYou: "What should we call you? (optional)",
  enterYourPwd: "Enter your password",
  signin: "Sign in",
  troubleSigningIn: "Trouble signing in?",
  aVerificationEmailSentTo: "A verification email has been sent to {email}.",
  pleaseCheck:
    "Please check your inbox and click on the link in the email to verify your account.",
  checkYourInbox: "Check your inbox",
  followInstructions:
    "Follow the instructions sent to {email} to recover your password.",
  recoverPwd: "Recover your password",
  getInstructionsText:
    "Get instructions sent to this email that explain how to reset your password.",
  send: "Send",
  error: {
    signInOffline:
      "You are offline. Please connect to the internet to sign in.",
    accountDeletionOffline:
      "You are offline. Please connect to the internet to delete your account.",
    incorrectPwdOrEmail: "Incorrect password or email {email}",
    incorrectPwd: "Incorrect password",
    noUserWithEmail: "No user found with email {email}",
    invalidEmail: "Invalid email {email}",
    userDisabled: "User with email {email} has been disabled",
    emailInUse: "Email {email} is already in use",
    signingIn: "Error signing in with email {email}",
    speechRecognitionPermissionDeniedHtml: `
    <strong>KifKaf needs the Speech Recognition permission for this.</strong><br>
    To grant it:<br>
    1. Go to your phone's <strong>Settings</strong>.<br>
    2. Scroll and tap on <strong>KifKaf</strong>.<br>
    3. Allow access to the <strong>Speech Recognition</strong>.<br><br>
    You have full control and can change your choices at any time.
    `,
    micAccessPermissionDeniedHtml: `
      <strong>KifKaf needs the Microphone permission for this.</strong><br>
      To grant it:<br>
      1. Go to your device's <strong>Settings</strong>.<br>
      2. Scroll and tap on <strong>KifKaf</strong>.<br>
      3. Allow access to the <strong>Microphone</strong>.<br><br>
      You have full control and can change your choices at any time.
    `,
    accountDeletionFailed:
      "We're sorry, but we couldn't delete your account as your last sign-in session has expired. Please log out, sign back in, and try deleting your account again.",
  },
  or: "or",
  and: "and",
  home: "Journal",
  insights: "Insights",
  thisMonth: "This month",
  thisYear: "This year",
  monthsList: {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    10: "October",
    11: "November",
    12: "December",
  },
  // daysList: {
  //   0: "Sunday",
  //   1: "Monday",
  //   2: "Tuesday",
  //   3: "Wednesday",
  //   4: "Thursday",
  //   5: "Friday",
  //   6: "Saturday",
  // },
  today: "Today",
  yesterday: "Yesterday",
  weeksAgo: "One week ago... | {count} weeks ago...",
  monthsAgo: "One month ago... | {count} months ago...",
  yearsAgo: "One year ago... | {count} years ago...",
  goodAfternoon: "Good Afternoon{comma}{name}",
  goodMorning: "Good Morning{comma}{name}",
  goodEvening: "Good Evening{comma}{name}",
  momentInputPrompt: "Got a feeling?",
  momentInputPlaceholder: "Feeling ... because ...",
  welcomeTutorial: {
    title: "Welcome to KifKaf",
    step1:
      "Capture life's ups and downs with micro-journaling. Your journal is designed to be secure and private, only you can read it.",
    step1Action: "Log a moment",
    dummyMoment: "Feeling excited to get to know me better with KifKaf!",
    step1DoneTitle: "First moment logged",
    step1DoneText:
      "Emotions are your body's language. Taking the time to listen and noting them down is a big step towards a better understanding of yourself.", //Embrace the habit of noting them down and you're halfway there!",
    step2:
      "For each moment, KifKaf surfaces the related needs and how well they're being met.", //journal entry
    step2Action: "View needs",
    step2DoneTitle: "Needs revealed",
    step2DoneText:
      "Behind every emotion lies an essential need. KifKaf is designed to help you decipher and understand these valuable connections.",
    // Feelings indicate what you need at the moment and whether those needs are being met.
    // "Understanding the deeper needs behind your feelings paves the way to fulfillment.",
    step3Empty:
      "Your emotions tell a story. After 3 moments, patterns start emerging.",
    step3EmptyCountdown:
      "Preparing your insights... This takes approximately 2 min.| Your emotions tell a story. Add one more moment to see patterns emerge. | Your emotions tell a story. Add {count} more moments to see patterns emerge.",
    step3Ready: "👇 Your insights are ready! 👇",
    step3Action: "Explore",
    step3DoneTitle: "You’re all set!",
    step3DoneText:
      "Keep logging moments to fine-tune KifKaf and get the most out of it.",
    complete: "complete | complete",
  },
  momentTitle: "Moment", //TODO:1 change for "Feeling"?
  moment: "1 moment | {count} moments",
  needs: "Needs",
  relatedNeeds: "Related needs",
  learnMore: "Learn more",
  why: "Why?",
  whyDefaultTitle: "Why am I seeing this?",
  satisfiedNeed: "Satisfied need",
  neutralNeed: "Neutral need",
  dissatisfiedNeed: "Dissatisfied need",
  momentSaved: "Moment saved",
  momentSavedOffline:
    "Moment saved. Needs analysis will be completed next time you’re online.",
  deleteMoment: "Delete moment",
  deleteMomentText: "This will automatically recalculate your insights.",
  delete: "Delete",
  momentDeleted: "Moment deleted",
  momentDeletedOffline:
    "Moment deleted. Your needs stats will be updated next time you’re online.",
  cancel: "Cancel",
  momentNeedsLearnMore: {
    title: "Needs list",
    html: "KifKaf analyzes your moment and reveals the underlying needs, whether they are satisfied, dissatisfied, or neutral (related to your feelings but neither satisfied nor frustrated).<br><br>Our analysis is based on 33 essential needs, organized into 5 distinct categories:",
  },
  needsCategories: {
    physiologicalAndSafety: "Physiological & Safety needs",
    connection: "Connection needs",
    esteem: "Esteem needs",
    personalGrowth: "Personal Growth needs",
    meaningAndTranscendence: "Meaning & Transcendence needs",
  },
  needsList: {
    "Physical Well-Being": "Physical Well-Being",
    "Sustenance & Nourishment": "Sustenance & Nourishment",
    Shelter: "Shelter",
    "Financial Security": "Financial Security",
    "Rest & Relaxation": "Rest & Relaxation",
    "Physical Movement": "Physical Movement",
    "Physical Contact & Intimacy": "Physical Contact & Intimacy",
    "Contact with Nature": "Contact with Nature",
    "Social Connection": "Social Connection",
    "Belongingness & Community": "Belongingness & Community",
    "Support, Understanding & Validation":
      "Support, Understanding & Validation",
    "Affection & Love": "Affection & Love",
    "Emotional Safety & Inner Peace": "Emotional Safety & Inner Peace",
    "Boundaries & Privacy": "Boundaries & Privacy",
    Autonomy: "Autonomy",
    "Self-Esteem & Social Recognition": "Self-Esteem & Social Recognition",
    "Competence & Effectiveness": "Competence & Effectiveness",
    "Outward Care & Contribution": "Outward Care & Contribution",
    "Self-Expression & Creativity": "Self-Expression & Creativity",
    "Exploration, Novelty & Inspiration": "Exploration, Novelty & Inspiration",
    Learning: "Learning",
    "Self-Actualization": "Self-Actualization",
    Challenge: "Challenge",
    "Play, Humor & Entertainment": "Play, Humor & Entertainment",
    "Fairness & Justice": "Fairness & Justice",
    "Order & Structure": "Order & Structure",
    "Meaning & Purpose": "Meaning & Purpose",
    "Gratitude & Celebration": "Gratitude & Celebration",
    "Spiritual Transcendence": "Spiritual Transcendence",
    Others: "Others",
  },
  gotIt: "Got it",
  save: "Save",
  fresh: "Fresh",
  summaryTitle: "{date}'s synthesis", //summary /
  summaryTitleThisMonth: "This month's synthesis",
  summaryTitleThisYear: "This year's synthesis",
  summarySubtitle: "Based on recurring patterns in your moments", //From /Derived from
  summaryEmpty: "👉 3 moments a month will bring your synthesis to life.",
  summaryEmptyCountdown:
    "Preparing your synthesis... This takes approximately 2 min. | 👉 One more moment to go this month to bring your synthesis to life. | 👉 {count} more moments to go this month to bring your synthesis to life.",
  quoteSubtitle: "Daily inspiration drawn from your moments",
  quoteWhyTitle: "Why this quote?",
  needsStats: {
    title: "{date}'s needs", //Need-O-Meter -  Needs fingerprint/Signature - NeedPrint
    titleThisMonth: "This month's needs",
    titleThisYear: "This year's needs",
    subtitle: "Based on the needs revealed in your feelings",
    learnMoreHtml:
      "KifKaf analyzes the emotions in your moments to update your needs stats.<br><br>Our method is based on 33 essential needs, organized into 5 distinct categories:",
    emptyInitSat:
      "Log a first positive feeling to discover the needs from which you get the most satisfaction.",
    emptyInitDissat:
      "Log a first negative feeling to discover the needs that cause you the most dissatisfaction.",
    emptyInitAll:
      "Log a first feeling to discover what needs bear the most importance to you!",
    emptyPeriodSat:
      "No satisfied needs yet for this period. | No satisfied needs for this period.",
    emptyPeriodDissat:
      "No dissatisfied needs yet for this period. |  No dissatisfied needs for this period. ",
    emptyPeriodAll:
      "No needs identified yet for this period. | No needs identified for this period.",
  },
  tops: "Tops",
  topSatisfier: "Top satisfier",
  topDissatisfier: "Top dissatisfier",
  topGainer: "Top gainer",
  topLoser: "Top loser",
  topSatEmpty:
    "No satisfied needs yet for this period. | No satisfied needs for this period.",
  topDissatEmpty:
    "No dissatisfied needs yet for this period. | No dissatisfied needs for this period.",
  topGainerEmpty:
    "No top gainer yet for this period. | No top gainer for this period.",
  topLoserEmpty:
    "No top loser yet for this period. | No top loser for this period.",
  ofAllSat: "of all satisfaction",
  ofAllDissat: "of all dissatisfaction",
  ofTotalImp: "importance",
  satVsLastMonth: "vs. previous month",
  satVsLastYear: "vs. previous year",
  satisfiers: "Satisfiers",
  dissatisfiers: "Dissatisfiers",
  all: "All",
  showMore: "Show more",
  bookSubtitle: "The right book for right now?",
  bookWhyTitle: "Why this book recommendation?",
  by: "by",
  bookEmpty:
    "👉 Log 3 moments to start getting reading recommendations curated for your growth.",
  bookEmptyCountdown:
    "👉 Preparing your reading recommendations... This takes approximately 2 min. | 👉 One more moment to go this month to start getting reading recommendations curated for your growth. | 👉 {count} more moments to go this month to start getting reading recommendations curated for your growth.",
  suggestionsTitle: "{date}'s suggestions",
  suggestionsTitleThisMonth: "This month's suggestions",
  suggestionsTitleThisYear: "This year's suggestions",
  suggestionsSubtitle: "Based on your ups and downs",
  toContinue: "Continue",
  toStop: "Stop",
  toStart: "Start?",
  suggestionsEmpty: "👉 3 moments a month will bring your suggestions to life.",
  suggestionsEmptyCountdown:
    "👉 Preparing your suggestions... This takes approximately 2 min. | 👉 One more moment to go this month to bring your suggestions to life. | 👉 {count} more moments to go this month to bring your suggestions to life.",
  filterPeriod: "Filter period",
  filterPeriodText:
    "Only the moments that happened during the selected period will be taken into account.",
  done: "Done",
  monthly: "Monthly",
  yearly: "Yearly",
  settings: "Settings",
  accountDetails: "Account details",
  name: "Name",
  email: "Email",
  janeDoeAccount: "jane.doe",
  janeDoeDomain: "email.com",
  janeDoeEmail: "@:janeDoeAccount{'@'}@:janeDoeDomain",
  pwd: "Password",
  appLanguage: "App language",
  speechRecoLanguage: "Speech recognition language",
  privacyPolicy: "Privacy policy",
  tos: "Terms of service",
  contactUs: "Contact us",
  logout: "Log out",
  dangerZone: "Danger zone",
  deleteAccount: "Delete account",
  deleteYourAccount: "Delete your account",
  accountDeletionInProgress: "Account deletion in progress",
  deletingYourAccount: "Deleting your account, please don't quit the app...",
  accountDeleted: "Account deleted",
  accountDeletedText:
    "Your account has been deleted. All your moments, insights, and associated data have been permanently erased.",
  changeName: "Change name",
  changeEmail: "Change email",
  changeEmailSubtitle:
    "You will be logged out and need to verify your new email on the next login.",
  enterYourEmail: "Enter your email address",
  enterYourPwdToConfirm: "Enter your password to confirm",
  changePwd: "Change password",
  existingPwd: "Existing password",
  enterYourExistingPwd: "Enter your existing password",
  newPwd: "New password",
  createNewPwd: "Create a new password",
  changeSpeechRecoLanguage: "Change speech recognition language",
  changeAppLanguage: "Change app language",
  logoutText: "You will be returned to the login screen.",
  deleteAccountText:
    "Deleting your account is permanent. All your moments, insights, and associated data will be permanently erased.",
  pleaseTypeName: "Please enter your name",
  pleaseTypeEmail: "Please enter your email address",
  pleaseTypeSmthg: "Please type something",
  emailMustBeValid: "Email must be valid",
  pwdMustBeValid: "Password must be at least 6 characters long",
  nameUpdated: "Name updated",
  emailUpdated: "Email updated",
  pwdUpdated: "Password updated",
  contactUsHtml1:
    "<p>It's our #1 priority to provide you with the smoothest possible experience. <br>Feedback, feature requests, and bug reports are always very welcome.</p>",
  contactUs2:
    "Whatever you need, just write us in the form below or email us at",
  weUsuallyReply: "We'll reply within 24 hours.",
  yourEmail: "Your email address",
  yourMessage: "Your message",
  pleaseTypeYourMessage: "Please type your message",
  messageSent: "Message sent to KifKaf team. Thank you!",
  inspirationalQuotes: [
    //keep this list's length to 11 or change getPlaceholderQuoteOfTheDayId argument
    {
      author: "Carl Jung",
      quote:
        "Your visions will become clear only when you can look into your own heart. Who looks outside, dreams; who looks inside, awakes.",
    },
    {
      author: "Socrates",
      quote: "The unexamined life is not worth living.",
    },
    {
      author: "Lao Tzu",
      quote:
        "He who knows others is wise; he who knows himself is enlightened.",
    },
    {
      author: "Anaïs Nin",
      quote: "We don't see things as they are, we see them as we are.",
    },
    {
      author: "William James",
      quote:
        "The greatest discovery of my generation is that a human being can alter his life by altering his attitudes.",
    },
    {
      author: "Jason Portnoy",
      quote:
        "Happiness isn’t something you find. It’s what’s left when you get rid of all the things that make you unhappy.",
    },
    {
      author: "Albert Camus",
      quote:
        "In the midst of winter, I found there was, within me, an invincible summer.",
    },
    {
      author: "Marcel Proust",
      quote:
        "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.",
    },
    {
      author: "Seneca",
      quote:
        "Life is not about waiting for the storm to pass, it's about learning to dance in the rain.",
    },

    {
      author: "Carl Jung",
      quote: "Who looks outside, dreams; who looks inside, awakes.",
    },
    {
      author: "Jon Kabat-Zinn",
      quote: "You can't stop the waves, but you can learn to surf.",
    },
  ],
  randomQuoteCountdown:
    "👉 Preparing your quote... This takes approximately 2 min. | 👉 This quote is not personalized. One more moment to go this month to see a quote inspired by your moments. | 👉 This quote is not personalized. {count} more moments to go this month to see a quote inspired by your moments. ",
};
