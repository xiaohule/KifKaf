import privacyPolicyPage from "./privacyPolicy";
import tosPage from "./tos";

export default {
  privacyPolicyPage,
  tosPage,
  login: "Connexion",
  loginToKifKaf: "Se connecter à KifKaf",
  continueWithGoogle: "Continuer avec Google",
  continueWithApple: "Continuer avec Apple",
  continueWithEmail: "Continuer avec un email",
  continue: "Continuer",
  byContinuingText: "En continuant, vous acceptez nos",
  whatShouldWeCallYou: "Comment souhaitez-vous qu'on vous nomme?",
  enterYourPwd: "Entrez votre mot de passe",
  signin: "Se connecter",
  troubleSigningIn: "Problème de connexion?",
  aVerificationEmailSentTo: "Un email de vérification a été envoyé à {email}.",
  pleaseCheck:
    "Veuillez vérifier votre boîte de réception et cliquer sur le lien dans l'email pour vérifier votre compte.",
  checkYourInbox: "Vérifier votre boîte de réception",
  followInstructions:
    "Suivez les instructions envoyées à {email} pour réinitialiser votre mot de passe.",
  recoverPwd: "Réinitialiser votre mot de passe",
  getInstructionsText:
    "Recevez des instructions à cet email pour réinitialiser votre mot de passe.",
  send: "Envoyer",
  error: {
    signInOffline:
      "Vous êtes hors ligne. Veuillez vous connecter à Internet pour continuer.",
    accountDeletionOffline:
      "Vous êtes hors ligne. Veuillez vous connecter à Internet pour supprimer votre compte.",
    incorrectPwdOrEmail: "Mot de passe ou email {email} incorrect",
    noUserWithEmail: "Aucun utilisateur trouvé avec l'email {email}",
    invalidEmail: "Email {email} invalide",
    userDisabled: "L'utilisateur avec l'email {email} a été désactivé",
    emailInUse: "L'email {email} est déjà utilisé",
    signingIn: "Erreur de connexion avec l'email {email}",
    speechRecognitionPermissionDeniedHtml: `
      <strong>KifKaf à besoin de la permission Reconnaissance vocale pour cela.</strong><br>
      Pour l'accorder:<br>
      1. Aller dans les <strong>Réglages</strong> de votre appareil.<br>
      2. Sélectionner <strong>KifKaf</strong>.<br>
      3. Autorisez l'accès à la <strong>Reconnaissance vocale</strong>.<br><br>
      Vous gardez le contrôle et pouvez changer vos choix à tout moment.
    `,
    micAccessPermissionDeniedHtml: `
      <strong>KifKaf à besoin de la permission Micro pour cela.</strong><br>
      Pour l'accorder:<br>
      1. Aller dans les <strong>Réglages</strong> de votre appareil.<br>
      2. Sélectionner <strong>KifKaf</strong>.<br>
      3. Autorisez l'accès au <strong>Micro</strong>.<br><br>
      Vous gardez le contrôle et pouvez changer vos choix à tout moment.
  `,
    accountDeletionFailed:
      "Nous sommes désolé mais nous n'avons pas pu supprimer votre compte car votre dernière connexion est expirée. S'il vous plaît, déconnectez-vous, reconnectez-vous et essayez de supprimer votre compte à nouveau.",
  },
  or: "ou",
  and: "et",
  home: "Journal",
  insights: "Explorer", //Analyse Eclairages Tendances Perspectives Besoins Besoins & +
  thisMonth: "Ce mois",
  thisYear: "Cette année",
  monthsList: {
    "01": "Janvier",
    "02": "Février",
    "03": "Mars",
    "04": "Avril",
    "05": "Mai",
    "06": "Juin",
    "07": "Juillet",
    "08": "Août",
    "09": "Septembre",
    10: "Octobre",
    11: "Novembre",
    12: "Décembre",
  },
  daysList: {
    0: "Dimanche",
    1: "Lundi",
    2: "Mardi",
    3: "Mercredi",
    4: "Jeudi",
    5: "Vendredi",
    6: "Samedi",
  },
  today: "Aujourd'hui",
  yesterday: "Hier",
  weeksAgo: "Il y a {count} semaine | Il y a {count} semaines",
  monthsAgo: "Il y a {count} mois",
  yearsAgo: "Il y a {count} an | Il y a {count} ans",
  goodAfternoon: "Bonjour",
  goodMorning: "Bonjour",
  goodEvening: "Bonsoir",
  momentInputPrompt: "Un nouveau Ressenti?",
  momentInputPlaceholder: "Je me sens ... parce que ...",
  welcomeTutorial: {
    title: "Bienvenue sur KifKaf",
    step1:
      "Capturez les bons et les mauvais moments dans votre journal intime KifKaf, accessible uniquement à vous.",
    step1Action: "Capturer un Ressenti", //Consignez/saisissez/immortalisez/enregistrez/capturez/documentez/notez
    dummyMoment:
      "Super enthousiaste à l'idée de mieux me connaître avec KifKaf!", //Hâte de mieux me comprendre en utilisant KifKaf!"
    step1DoneTitle: "Premier Ressenti capturé",
    step1DoneText:
      "Les émotions sont le langage de votre corps. Les entendre et les noter est le premier pas vers une meilleure connaissance de soi." /*Tenir un journal de celles-ci est déjà un grand pas vers une vie plus épanouie!"*/ /*Avoir l'habitude de les écouter et de les noter*/, //TODO:6 clarifier et différencier de step2DoneText
    step2:
      "Pour chaque Ressenti, KifKaf identifie les besoins associés et leur degré de satisfaction.",
    step2Action: "Voir les besoins",
    step2DoneTitle: "Besoins révélés",
    step2DoneText:
      "Chaque émotion est l'expression d'un besoin. KifKaf vous aide à faire ce lien.",
    step3Empty:
      "Après 3 Ressentis, la trame de vos besoins commence à se dessiner.",
    // Vos émotions dressent une empreinte unique de besoins. Dès 3 Ressentis, des tendances commencent à émerger.",
    //   "Dès 3 Ressentis, KifKaf établi une première analyse reconnait des patterns et le profil unique de vos besoins commence à émerger.",
    // Vos émotions racontent une histoire. Dès 3 Ressentis, des tendances commencent à émerger.",
    step3EmptyCountdown:
      "Préparation de votre analyse... | Capturez encore {count} Ressenti pour accéder à votre analyse. | Capturez encore {count} Ressentis pour accéder à votre analyse.",
    step3Ready: "👇 Votre analyse est prête! 👇",
    step3Action: "Explorer votre analyse",
    step3DoneTitle: "Tout est prêt!", //TODO:6 s'assurer que tt est dégenré, et avoir des CTA clair et vendre les bénéfices du produit et non le produit lui-même
    step3DoneText:
      "Continuez à capturer vos Ressentis pour affiner les éclairages apportés par KifKaf. Bientôt, vous n'aurez plus de secrets pour vous-même.",
    complete: "terminé | terminés",
  },
  moment: "Ressenti",
  needs: "Besoins",
  relatedNeeds: "Besoins associés",
  learnMore: "En savoir plus",
  why: "Pourquoi?",
  whyDefaultTitle: "Pourquoi est-ce que je vois ça?",
  satisfiedNeed: "Besoin satisfait",
  neutralNeed: "Besoin neutre",
  dissatisfiedNeed: "Besoin frustré",
  momentSaved: "Ressenti enregistré",
  momentSavedOffline:
    "Ressenti enregistré. L'analyse des besoins s'effectuera dès que vous serez connecté à Internet.",
  deleteMoment: "Effacer le Ressenti",
  deleteMomentText: "La météo de vos besoins sera mise à jour.",
  delete: "Effacer",
  momentDeleted: "Ressenti effacé",
  momentDeletedOffline:
    "Ressenti effacé. Votre météo des besoins sera mise à jour dès que vous serez connecté à Internet.",
  cancel: "Annuler",
  momentNeedsLearnMore: {
    title: "Liste des besoins",
    html: "KifKaf analyse votre Ressenti et met en lumière les besoins sous-jacents.<br><br>Notre méthode s'appuie sur 33 besoins essentiels, organisés en 5 catégories distinctes :", //, qu'ils soient satisfaits, frustrés ou neutres (liés à votre Ressenti mais ni satisfait ni frustré)
  },
  needsCategories: {
    physiologicalAndSafety: "Besoins physiologique et de sécurité",
    connection: "Besoins de connexion",
    esteem: "Besoins d'estime de soi",
    personalGrowth: "Besoins de développement personnel",
    meaningAndTranscendence: "Besoins de sens et de transcendance",
  },
  needsList: {
    "Physical Well-Being": "Bien-être physique",
    "Sustenance & Nourishment": "Subsistance et nourriture",
    Shelter: "Abri",
    "Financial Security": "Stabilité financière",
    "Rest & Relaxation": "Repos et relaxation",
    "Physical Movement": "Mouvement physique",
    "Physical Contact & Intimacy": "Contact physique et intimité",
    "Contact with Nature": "Contact avec la nature",
    "Social Connection": "Connexion aux autres",
    "Belongingness & Community": "Appartenance et communauté",
    "Support, Understanding & Validation":
      "Soutien, compréhension et validation",
    "Affection & Love": "Amour et affection",
    "Emotional Safety & Inner Peace":
      "Sécurité émotionnelle et paix intérieure",
    "Boundaries & Privacy": "Respect des limites et vie privée",
    Autonomy: "Autonomie",
    "Self-Esteem & Social Recognition":
      "Estime de soi et reconnaissance sociale",
    "Competence & Effectiveness": "Compétence et efficacité",
    "Outward Care & Contribution": "Engagement social",
    "Self-Expression & Creativity": "Expression personnelle et créativité",
    "Exploration, Novelty & Inspiration":
      "Exploration, nouveauté et inspiration",
    Learning: "Apprentissage",
    "Self-Actualization": "Réalisation de soi",
    Challenge: "Challenge",
    "Play, Humor & Entertainment": "Humour et divertissement",
    "Fairness & Justice": "Equité et justice",
    "Order & Structure": "Ordre et structure",
    "Meaning & Purpose": "Sens et mission",
    "Gratitude & Celebration": "Gratitude et célébration",
    "Spiritual Transcendence": "Spiritualité" /*Transcendance et sacré"*/,
  },
  gotIt: "OK",
  save: "Enregistrer",
  fresh: "Nouveau",
  summaryTitle: "Aperçu de {date}",
  summaryTitleThisMonth: "Aperçu du mois",
  summaryTitleThisYear: "Aperçu de l'année",
  summarySubtitle: "Coup d'oeil sur vos besoins du moment",
  summaryEmpty: "👉 3 Ressentis par mois donneront vie à votre aperçu.",
  summaryEmptyCountdown:
    "Préparation de votre aperçu... | 👉 Encore {count} Ressenti à saisir ce mois-ci pour donner vie à votre aperçu. | 👉 Encore {count} Ressentis à saisir ce mois-ci pour donner vie à votre aperçu.",
  quoteSubtitle: "Citation inspirée par vos Ressentis",
  quoteWhyTitle: "Pourquoi cette citation?",
  needsStats: {
    title: "Besoins de {date}",
    titleThisMonth: "Besoins du mois",
    titleThisYear: "Besoins de l'année",
    subtitle: "La météo de vos besoins",
    learnMoreHtml:
      "KifKaf analyse chacun de vos Ressentis pour mettre à jour la météo de vos besoins.<br><br>Notre méthode s'appuie sur 33 besoins essentiels, organisés en 5 catégories distinctes :",
    emptyInitSat:
      "Capturez un Ressenti positif pour commencer à découvrir vos besoins les plus satisfaits.",
    emptyInitDissat:
      "Capturez un premier Ressenti négatif pour commencer à découvrir vos besoins les plus frustrés.",
    emptyInitAll:
      "Capturez un premier Ressenti pour commencer à découvrir les besoins les plus importants pour vous.",
    emptyPeriodSat:
      "Pas encore de besoins satisfaits sur cette période. | Pas de besoins satisfaits sur cette période.",
    emptyPeriodDissat:
      "Pas encore de besoins frustrés sur cette période. |  Pas de besoins frustrés sur cette période.",
    emptyPeriodAll:
      "Pas encore de besoins identifiés pour cette période. | Pas de besoins identifiés pour cette période. ",
  },
  //   Source de Kifs/Source de Kafs
  // Dynamiseur/Sapeur
  // Source d'énergie/Drain d'énergie
  // Energisant / Épuisant
  tops: "Tops",
  topSatisfier: "Top satisfacteur",
  topDissatisfier: "Top frustrateur",
  topGainer: "Plus forte hausse de satisfaction",
  topLoser: "Plus forte baisse de satisfaction",
  topSatEmpty:
    "Pas encore de besoins satisfaits sur cette période. | Pas de besoins satisfaits sur cette période.",
  topDissatEmpty:
    "Pas encore de besoins frustrés sur cette période. | Pas de besoins frustrés sur cette période.",
  topGainerEmpty:
    "Pas de forte hausse sur cette période. | Pas de forte hausse sur cette période.",
  topLoserEmpty:
    "Pas de forte baisse sur cette période. | Pas de forte baisse sur cette période.",
  ofAllSat: "de toute la satisfaction",
  ofAllDissat: "de toute la frustration",
  ofTotalImp: "de l'importance totale",
  satVsLastMonth: "satisfaction vs mois précédent",
  satVsLastYear: "satisfaction vs année précédente",
  satisfiers: "Satisfacteurs",
  dissatisfiers: "Frustrateurs",
  all: "Tous",
  showMore: "Tout afficher",
  bookSubtitle: "Le bon livre pour maintenant?",
  bookWhyTitle: "Pourquoi ce livre?",
  by: "par",
  bookEmpty:
    "👉 3 Ressentis par mois vous donneront des recommandations de lecture inspirées par votre journal",
  bookEmptyCountdown:
    "Préparation de vos recommandations de lecture... | 👉 Encore {count} Ressenti à saisir ce mois-ci pour voir des recommandations de lecture inspirées par votre journal. | 👉 Encore {count} Ressentis à saisir ce mois-ci pour voir des recommandations de lecture inspirées par votre journal.",
  suggestionsTitle: "Suggestions de {date}",
  suggestionsTitleThisMonth: "Suggestions du mois",
  suggestionsTitleThisYear: "Suggestions de l'année",
  suggestionsSubtitle: "Ajustements personnalisés à prendre ou à laisser",
  toContinue: "À continuer",
  toStop: "À stopper",
  toStart: "À démarrer?",
  suggestionsEmpty: "👉 3 Ressentis par mois donneront vie à vos suggestions.",
  suggestionsEmptyCountdown:
    "Préparation de vos suggestions... | 👉 Encore {count} Ressenti à saisir ce mois-ci pour donner vie à vos suggestions. | 👉 Encore {count} Ressentis à saisir ce mois-ci pour donner vie à vos suggestions.",
  filterPeriod: "Sélectionnez une période",
  filterPeriodText:
    "L'analyse prendra en compte uniquement les Ressentis de la période sélectionnée.",
  done: "OK",
  monthly: "Par mois",
  yearly: "Par année",
  settings: "Paramètres",
  accountDetails: "Compte",
  name: "Nom",
  email: "Email",
  janeDoeAccount: "jeanne.dupont",
  janeDoeDomain: "email.com",
  janeDoeEmail: "@:janeDoeAccount{'@'}@:janeDoeDomain",
  pwd: "Mot de passe",
  appLanguage: "Langue de l'application",
  speechRecoLanguage: "Langue de la reconnaissance vocale",
  privacyPolicy: "Politique de confidentialité",
  tos: "Conditions de service",
  contactUs: "Contactez-nous",
  logout: "Se déconnecter",
  dangerZone: "Zone de danger",
  deleteAccount: "Supprimer mon compte",
  deleteYourAccount: "Suppresion de votre compte",
  accountDeletionInProgress: "Suppression de votre compte en cours",
  deletingYourAccount:
    "Suppression de votre compte en cours, veuillez rester sur cette page...",
  accountDeleted: "Compte supprimé",
  accountDeletedText:
    "Votre compte a été supprimé. Tout vos Ressentis, éclairages et données associées ont été effacés.",
  changeName: "Changer de nom",
  changeEmail: "Changer d'email",
  enterYourEmail: "Entrez votre adresse email",
  enterYourPwdToConfirm: "Entrez votre mot de passe pour confirmer",
  changePwd: "Changer de mot de passe",
  existingPwd: "Mot de passe actuel",
  enterYourExistingPwd: "Entrez votre mot de passe actuel",
  newPwd: "Nouveau mot de passe",
  createNewPwd: "Créer un nouveau mot de passe",
  changeSpeechRecoLanguage: "Changer la langue de la reconnaissance vocale",
  changeAppLanguage: "Changer la langue de l'application",
  logoutText: "Vous serez redirigé vers l'écran de connexion.",
  deleteAccountText:
    "La suppression de votre compte est définitive. Tous vos Ressentis, éclairages et données associées seront effacés.",
  pleaseTypeName: "Veuillez saisir votre nom",
  pleaseTypeEmail: "Veuillez saisir votre email",
  pleaseTypeSmthg: "Veuillez saisir quelque chose",
  emailMustBeValid: "L'email doit être valide",
  pwdMustBeValid: "Le mot de passe doit contenir au moins 6 caractères",
  nameUpdated: "Nom mis à jour",
  emailUpdated: "Email mis à jour",
  pwdUpdated: "Mot de passe mis à jour",
  contactUsHtml:
    "<p>C'est notre priorité numéro 1 que de vous offrir la meilleure expérience possible.<br/> Vos retours sont toujours les bienvenus.</p><p>Quelque soit votre demande, écrivez-nous dans le formulaire ci-dessous ou envoyez-nous un email à :</p>",
  yourEmail: "Votre adresse email",
  yourMessage: "Votre message",
  pleaseTypeYourMessage: "Veuillez saisir votre message",
  messageSent: "Message envoyé à l'équipe KifKaf. Merci!",
  inspirationalQuotes: [
    ////keep this list's length to 11 or change getPlaceholderQuoteOfTheDayId argument
    {
      author: "Socrates",
      quote: "La vie non examinée ne vaut pas la peine d'être vécue.",
    },
    {
      author: "Lao Tzu",
      quote:
        "Qui connaît les hommes est averti; qui se connaît soi-même est éclairé.",
    },
    {
      author: "William James",
      quote:
        "La plus grande découverte de notre génération a été de s'apercevoir qu'un homme peut changer sa vie en modifiant sa façon de penser.",
    },
    {
      author: "Albert Camus",
      quote: "Au milieu de l'hiver, j'ai découvert en moi un invincible été.",
    },
    {
      author: "Marcel Proust",
      quote:
        "Le véritable voyage de découverte ne consiste pas à chercher de nouveaux paysages, mais à avoir de nouveaux yeux.",
    },

    {
      author: "François de La Rochefoucauld",
      quote:
        "Le plus grand secret pour le bonheur, c'est d'être bien avec soi.",
    },
    {
      author: "Sénèque",
      quote:
        "La vie, ce n'est pas d'attendre que les orages passent, c'est d'apprendre comment danser sous la pluie.",
    },
    {
      author: "Jason Portnoy",
      quote:
        "Le bonheur n’est pas quelque chose que l’on trouve. C’est ce qui reste lorsque vous vous débarrassez de tout ce qui vous rend malheureux.",
    },
    {
      author: "Eckhart Tolle",
      quote:
        "Reconnaître ses propres émotions et sentiments est le premier pas vers la compréhension de soi-même.",
    },
    {
      author: "Carl Jung",
      quote:
        "Celui qui regarde à l'extérieur rêve. Celui qui regarde à l'intérieur s'éveille.",
    },
    {
      author: "Jon Kabat-Zinn",
      quote:
        "Vous ne pouvez pas arrêter les vagues, mais vous pouvez apprendre à les surfer.",
    },
    // {
    //   author: "Søren Kierkegaard",
    //   quote:
    //     "La vie ne peut être comprise qu'en regardant en arrière; mais elle doit être vécue en regardant en avant.",
    // },
  ],
  randomQuoteCountdown:
    "Préparation de votre citation... | 👉 Cette citation n'est pas personnalisée. Encore {count} Ressenti à saisir ce mois-ci pour qu'elle soit inspirée par votre journal. | 👉 Cette citation n'est pas personnalisée. Encore {count} Ressentis à saisir ce mois-ci pour qu'elle soit inspirée par votre journal.",
};
