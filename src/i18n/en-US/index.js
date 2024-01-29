import privacyPolicyPage from "./privacyPolicy";
import tosPage from "./tos";

export default {
  privacyPolicyPage,
  tosPage,
  login: "Log in",
  loginToKifKaf: "Log in to KifKaf",
  continueWithGoogle: "Continue with Google",
  continueWithApple: "Continue with Apple",
  continueWithEmail: "Continue with Email",
  byContinuingText: "By continuing, you are indicating that you accept our",
  whatShouldWeCallYou: "What should we call you?",
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
  daysList: {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  },
  today: "Today",
  yesterday: "Yesterday",
  weeksAgo: "{count} week ago | {count} weeks ago",
  monthsAgo: "{count} month ago | {count} months ago",
  yearsAgo: "{count} year ago | {count} years ago",
  goodAfternoon: "Good Afternoon",
  goodMorning: "Good Morning",
  goodEvening: "Good Evening",
  momentInputPrompt: "Got a feeling?",
  momentInputPlaceholder: "Feeling ... because ...",
  welcomeTutorial: {
    title: "Welcome to KifKaf",
    step1:
      "Capture life's ups and downs with micro-journaling. Your moments are private, only you can see them.",
    step1Action: "Log a moment",
    step1DoneTitle: "First moment logged",
    step1DoneText:
      "Emotions are your body's language. Embrace the habit of noting them down and you're halfway there!",
    step2:
      "For each moment, KifKaf surfaces the related needs and how well they're being met.",
    step2Action: "View needs",
    step2DoneTitle: "Needs revealed",
    step2DoneText:
      "Understanding the deeper needs behind your feelings paves the way to fulfillment.",
    step3Empty:
      "Your emotions tell a story. After 3 Moments, patterns start emerging.",
    step3EmptyCountdown:
      "Preparing your Insights...| Your emotions tell a story. Add {count} more Moment to see patterns emerge. | Your emotions tell a story. Add {count} more Moments to see patterns emerge.",
    step3Ready: "👇 Your Insights are ready! 👇",
    step3Action: "Explore Insights",
    step3DoneTitle: "You’re all set!",
    step3DoneText:
      "Keep logging Moments to fine-tune KifKaf and get the most out of it.",
    complete: "complete | complete",
  },
  moment: "Moment", //TODO:6 change for "Feeling"?
  needs: "Needs",
  relatedNeeds: "Related needs",
  learnMore: "Learn more",
  why: "Why?",
  satisfiedNeed: "Satisfied need",
  neutralNeed: "Neutral need",
  dissatisfiedNeed: "Dissatisfied need",
  momentSaved: "Moment saved",
  momentSavedOffline:
    "Moment saved. Needs analysis will complete next time you’re online.",
  deleteMoment: "Delete moment",
  deleteMomentText: "We will automatically recalculate your Insights.",
  momentDeleted: "Moment deleted",
  momentDeletedOffline:
    "Moment deleted. Insights recalculation will complete next time you’re online.",
  cancel: "Cancel",
  momentNeedsLearnMore: {
    title: "Needs list",
    html: "These are the needs related to your moment picked from our list of Universal Human Needs. <br><br>The full list is composed of:",
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
  },
  gotIt: "Got it",
  save: "Save",
  fresh: "Fresh",
  summaryTitle: "{date}'s summary",
  summaryTitleThisMonth: "This month's summary",
  summaryTitleThisYear: "This year's summary",
  summarySubtitle: "A quick peek at someone amazing",
  summaryEmpty: "👉 3 Moments a month will bring your summary to life.",
  summaryEmptyCountdown:
    "Preparing your summary... | 👉 {count} more Moment to go this month to bring your summary to life. | 👉 {count} more Moments to go this month to bring your summary to life.",
  quoteSubtitle: "Daily inspiration drawn from your Moments",
  needsWeatherTitle: "{date}'s needs",
  needsWeatherTitleThisMonth: "This month's needs",
  needsWeatherTitleThisYear: "This year's needs",
  needsWeatherSubtitle: "Your needs weather report",
  tops: "Tops",
  topSatisfier: "Top satisfier",
  topDissatisfier: "Top dissatisfier",
  topGainer: "Top gainer",
  topLoser: "Top loser",
  topSatEmpty: "No satisfied needs yet for this period.",
  topDissatEmpty: "No dissatisfied needs yet for this period.",
  topGainerEmpty: "No top gainer yet for this period.",
  topLoserEmpty: "No top loser yet for this period.",
  ofAllSat: "of all satisfaction",
  ofAllDissat: "of all dissatisfaction",
  ofTotalImp: "of total importance",
  satVsLastMonth: "satisfaction vs last month",
  satisfiers: "Satisfiers",
  dissatisfiers: "Dissatisfiers",
  all: "All",
  showMore: "Show more",
  bookSubtitle: "The Right Book for Right Now?",
  by: "by",
  bookEmpty:
    "👉 Log 3 Moments to start getting reading recommendations curated for your growth.",
  bookEmptyCountdown:
    "Preparing your reading recommendations... | 👉 {count} more Moment to go this month to start getting reading recommendations curated for your growth. | 👉 {count} more Moments to go this month to start getting reading recommendations curated for your growth.",
  suggestionsTitle: "{date}'s suggestions",
  suggestionsTitleThisMonth: "This month's suggestions",
  suggestionsTitleThisYear: "This year's suggestions",
  suggestionsSubtitle: "Take it or leave it: custom tweaks for life’s peaks",
  continue: "Continue",
  stop: "Stop",
  start: "Start?",
  suggestionsEmpty: "👉 3 Moments a month will bring your suggestions to life.",
  suggestionsEmptyCountdown:
    "Preparing your suggestions... | 👉 {count} more Moment to go this month to bring your suggestions to life. | 👉 {count} more Moments to go this month to bring your suggestions to life.",
  filterPeriod: "Filter period",
  filterPeriodText:
    "Filtering the period will take into account only the moments that happened during the selected period.",
  done: "Done",
  monthly: "Monthly",
  yearly: "Yearly",
  settings: "Settings",
  accountDetails: "Account details",
  name: "Name",
  email: "Email",
  janeDoeEmail: "jane.doe@mail.com",
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
  enterYourEmail: "Enter your email address",
  enterYourPwdToConfirm: "Enter your password to confirm",
  changePassword: "Change password",
  existingPwd: "Existing password",
  enterYourExistingPwd: "Enter your existing password",
  newPwd: "New password",
  createNewPwd: "Create a new password",
  changeSpeechRecoLanguage: "Change speech recognition language",
  changeAppLanguage: "Change app language",
  logoutText: "You will be returned to the login screen.",
  deleteAccountText:
    "Deleting your account is permanent. All your moments, insights, and associated data will be permanently erased.",
  pleaseTypeName: "Please type your name",
  pleaseTypeEmail: "Please type your email address",
  pleaseTypeSmthg: "Please type something",
  emailMustBeValid: "Email must be valid",
  pwdMustBeValid: "Password should be at least 6 characters long",
  nameUpdated: "Name updated",
  emailUpdated: "Email updated",
  pwdUpdated: "Password updated",
  contactUsHtml:
    "<p>It's our #1 priority to provide you with the smoothest possible experience. <br />Feedback, feature requests, and bug reports are always very welcome.</p><p>Whatever you need, just write us in the form below or email us at:</p>",
  yourEmail: "Your email address",
  yourMessage: "Your message",
  pleaseTypeYourMessage: "Please type your message",
  messageSent: "Message sent to KifKaf team. Thank you!",
  inspirationalQuotes: [
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
  randomQuoteText:
    "👉 This was a random quote, log 3 more Moments to see personalized quotes inspired by your Moments.",
};
