import privacyPolicyPage from "./privacyPolicy";
import tosPage from "./tos";

export default {
  privacyPolicyPage,
  tosPage,
  login: "Se connecter",
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
    "Consultez votre boîte de réception et cliquer sur le lien dans l'email pour activer votre compte.",
  checkYourInbox: "Vérifier votre boîte de réception",
  followInstructions:
    "Suivez les instructions envoyées à {email} pour réinitialiser votre mot de passe.",
  recoverPwd: "Réinitialiser le mot de passe",
  getInstructionsText:
    "Recevez des instructions à cet email pour réinitialiser votre mot de passe.",
  send: "Envoyer",
  error: {
    signInOffline:
      "Vous êtes hors ligne. Veuillez vous connecter à Internet pour continuer.",
    accountDeletionOffline:
      "Vous devez être connecté à Internet pour supprimer votre compte.",
    incorrectPwdOrEmail: "Mot de passe ou email {email} incorrect",
    noUserWithEmail: "Aucun utilisateur trouvé avec l'email {email}",
    invalidEmail: "Email {email} invalide",
    userDisabled: "L'utilisateur avec l'email {email} a été désactivé",
    emailInUse: "L'email {email} est déjà utilisé",
    signingIn: "Erreur de connexion avec l'email {email}",
    speechRecognitionPermissionDeniedHtml: `
      <strong>KifKaf a besoin de la permission Reconnaissance vocale pour cela.</strong><br>
      Pour l'accorder:<br>
      1. Aller dans les <strong>Réglages</strong> de votre appareil.<br>
      2. Sélectionner <strong>KifKaf</strong>.<br>
      3. Autorisez l'accès à la <strong>Reconnaissance vocale</strong>.<br><br>
      Vous gardez le contrôle et pouvez changer vos choix à tout moment.
    `,
    micAccessPermissionDeniedHtml: `
      <strong>KifKaf a besoin de la permission Micro pour cela.</strong><br>
      Pour l'accorder:<br>
      1. Aller dans les <strong>Réglages</strong> de votre appareil.<br>
      2. Sélectionner <strong>KifKaf</strong>.<br>
      3. Autorisez l'accès au <strong>Micro</strong>.<br><br>
      Vous gardez le contrôle et pouvez changer vos choix à tout moment.
  `,
    accountDeletionFailed:
      "Nous sommes désolé mais nous n'avons pas pu supprimer votre compte car votre dernière connexion est expirée. Veuillez vous déconnecter, puis vous reconnecter et essayer de nouveau de supprimer votre compte.",
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
  weeksAgo:
    "souvenir de la semaine dernière | Souvenir d'il y a {count} semaines",
  monthsAgo: "Souvenir du mois dernier | Souvenir d'il y a {count} mois",
  yearsAgo: "Souvenir de l'année dernière | Souvenir d'il y a {count} ans",
  goodAfternoon: "Bonjour",
  goodMorning: "Bonjour",
  goodEvening: "Bonsoir",
  momentInputPrompt: "Une nouvelle émotion?",
  momentInputPlaceholder: "Je me sens ... parce que ...",
  welcomeTutorial: {
    title: "Bienvenue sur KifKaf",
    step1:
      "Capturez les bons et les mauvais moments dans votre journal intime KifKaf, accessible uniquement à vous.", //TODO:6 ajouter un slide ou mettre double dose sur confidentialité
    step1Action: "Capturer une émotion", //capturez/saisissez/enregistrez/notez Captez/Consignez//immortalisez///documentez/
    dummyMoment:
      "Super enthousiaste à l'idée de mieux me connaître avec KifKaf!", //Hâte de mieux me comprendre en utilisant KifKaf!"
    step1DoneTitle: "Première émotion capturée",
    step1DoneText:
      "Les émotions sont le langage de votre corps. Prendre le temps de les entendre et les noter est un grand pas vers une meilleure compréhension de vous-même." /*Tenir un journal de celles-ci est déjà un grand pas vers une vie plus épanouie!"*/ /*Avoir l'habitude de les écouter et de les noter*/, //TODO:6 clarifier et différencier de step2DoneText
    step2:
      "Pour chaque note saisie dans votre journal, KifKaf identifie les besoins associés et leur degré de satisfaction.",
    step2Action: "Voir les besoins",
    step2DoneTitle: "Besoins révélés",
    step2DoneText:
      "Derrière chaque émotion se cache un besoin essentiel. KifKaf est conçu pour vous aider à déchiffrer et comprendre ces liens précieux.", //      "Chaque émotion est l'expression d'un besoin. KifKaf vous aide à faire ce lien.",
    step3Empty:
      "Dès 3 notes dans votre journal, la trame de vos besoins commence à se dessiner.",
    // Vos émotions dressent une empreinte unique de besoins. Dès 3 émotions, des tendances commencent à émerger.",
    //   "Dès 3 émotions, KifKaf établi une première analyse reconnait des patterns et le profil unique de vos besoins commence à émerger.",
    // Vos émotions racontent une histoire. Dès 3 émotions, des tendances commencent à émerger.",
    step3EmptyCountdown:
      "Préparation de vos éclairages en cours. Cela prend environ 2 min. | Dès 3 notes dans votre journal, KifKaf vous propose de premiers éclairages. Plus qu'une note pour les générer. | Dès 3 notes dans votre journal, KifKaf vous propose de premiers éclairages. Plus que {count} notes pour les générer.",
    step3Ready: "👇 Vos éclairages sont prêts! 👇",
    step3Action: "Explorer",
    step3DoneTitle: "Tout est prêt!", //TODO:6 s'assurer que tt est dégenré, et avoir des CTA clair et vendre les bénéfices du produit et non le produit lui-même
    step3DoneText:
      "Capturez régulièrement vos émotions pour affiner les éclairages apportés par KifKaf. Bientôt, vous n'aurez plus de secrets pour vous-même.",
    complete: "terminé | terminés",
  },
  momentTitle: "Note",
  moment: "1 note | {count} notes",
  momentInYourJournal:
    "1 note de votre journal | {count} notes de votre journal",
  needs: "Besoins",
  relatedNeeds: "Besoins associés",
  learnMore: "En savoir plus",
  why: "Pourquoi?",
  whyDefaultTitle: "Pourquoi est-ce que je vois ça?",
  satisfiedNeed: "Besoin satisfait",
  neutralNeed: "Besoin neutre",
  dissatisfiedNeed: "Besoin frustré",
  momentSaved: "Note enregistrée",
  momentSavedOffline:
    "Note enregistrée. L'analyse des besoins s'effectuera dès que vous serez connecté à Internet.",
  deleteMoment: "Supprimer la note",
  deleteMomentText: "", //j'ai retiré "Les statistiques de vos besoins seront mises à jour." pke trop geek
  delete: "Supprimer",
  momentDeleted: "Note supprimée",
  momentDeletedOffline:
    "Note supprimée. Les statistiques de vos besoins seront mises à jour dès que vous serez connecté à Internet.",
  cancel: "Annuler",
  momentNeedsLearnMore: {
    title: "Liste des besoins",
    html: "KifKaf analyse les émotions présentes dans votre note et met en lumière les besoins sous-jacents.<br><br>Notre méthode s'appuie sur 33 besoins essentiels, organisés en 5 catégories distinctes :", //, qu'ils soient satisfaits, frustrés ou neutres (liés à votre émotions mais ni satisfait ni frustré)
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
    Others: "Autres",
  },
  gotIt: "OK",
  save: "Enregistrer",
  fresh: "Nouveau",
  summaryTitle: "Synthèse de {date}",
  summaryTitleThisMonth: "Synthèse du mois",
  summaryTitleThisYear: "Synthèse de l'année",
  summarySubtitle: "À partir des motifs récurrents de votre journal", //ou Extrait des motifs récurrents dans vos notes //Basé sur les motifs récurrents de vos notes //quintessence/distillat/extraction/essence/patterns/trame/thèmes/motifs
  summaryEmpty: "👉 3 notes par mois donneront vie à votre synthèse.",
  summaryEmptyCountdown:
    "👉 Préparation de votre synthèse en cours. Cela prend environ 2 min. | 👉 Plus qu'une note à saisir ce mois-ci pour accéder à votre synthèse. | 👉 Encore {count} notes à saisir ce mois-ci pour accéder à votre synthèse.",
  quoteSubtitle: "Citation inspirée par votre journal",
  quoteWhyTitle: "Pourquoi cette citation?",
  needsStats: {
    title: "Besoins de {date}", //Baromètre/Jauge des besoins
    titleThisMonth: "Besoins du mois",
    titleThisYear: "Besoins de l'année",
    subtitle: "À partir des besoins révélés par vos émotions", //Calculé à /révélés associés
    learnMoreHtml:
      "KifKaf analyse chacunes des émotions présentes dans vos notes pour mettre à jour les statistiques de vos besoins.<br><br>Notre méthode s'appuie sur 33 besoins essentiels, organisés en 5 catégories distinctes :",
    emptyInitSat:
      "Capturez une première émotion positive pour commencer à découvrir vos besoins satisfaits.",
    emptyInitDissat:
      "Capturez une première émotion négative pour commencer à découvrir vos besoins frustrés.",
    emptyInitAll:
      "Capturez une première émotion pour commencer à découvrir les besoins les plus importants pour vous.",
    emptyPeriodSat:
      "Pas encore de besoins satisfaits sur cette période. | Pas de besoins satisfaits sur cette période.",
    emptyPeriodDissat:
      "Pas encore de besoins frustrés sur cette période. |  Pas de besoins frustrés sur cette période.",
    emptyPeriodAll:
      "Pas encore de besoins identifiés sur cette période. | Pas de besoins identifiés sur cette période. ",
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
  ofAllSat: "de vos satisfactions",
  ofAllDissat: "de vos frustrations",
  ofTotalImp: "d'importance",
  satVsLastMonth: "vs. mois précédent",
  satVsLastYear: "satisfaction vs année précédente",
  satisfiers: "Satisfacteurs",
  dissatisfiers: "Frustrateurs",
  all: "Tous",
  showMore: "Tout afficher",
  bookSubtitle: "Lecture inspirée par votre journal",
  bookWhyTitle: "Pourquoi cette lecture?",
  by: "par",
  bookEmpty:
    "👉 3 notes par mois donneront vie à vos recommandations de lecture.",
  bookEmptyCountdown:
    "👉 Préparation de vos recommandations de lecture en cours. Cela prend environ 2 min. | 👉 Plus qu'une note à saisir ce mois-ci pour accéder à vos recommandations de lecture. | 👉 Encore {count} notes à saisir ce mois-ci pour accéder à vos recommandations de lecture.",
  suggestionsTitle: "Suggestions de {date}",
  suggestionsTitleThisMonth: "Suggestions du mois",
  suggestionsTitleThisYear: "Suggestions de l'année",
  suggestionsSubtitle: "À partir de vos joies et peines", //Élaborées Créées Modelées à partir de vos joies et peines / parcours /lutte/défis/épreuves/obstacles/difficultés
  toContinue: "À continuer",
  toStop: "À stopper",
  toStart: "À démarrer?",
  suggestionsEmpty: "👉 3 notes par mois donneront vie à vos suggestions.",
  suggestionsEmptyCountdown:
    "👉 Préparation de vos suggestions en cours. Cela prend environ 2 min. | 👉 Plus qu'une note à saisir ce mois-ci pour accéder à vos suggestions. | 👉 Encore {count} notes à saisir ce mois-ci pour accéder à vos suggestions.",
  filterPeriod: "Sélectionnez une période",
  filterPeriodText:
    "Seules vos notes de journal datées de la période sélectionnée seront prises en compte.",
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
  speechRecoLanguage: "Langue de reconnaissance vocale",
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
    "Votre compte a été supprimé. L'intégralité des données associées a été supprimée.",
  changeName: "Changer de nom",
  changeEmail: "Changer d'email",
  enterYourEmail: "Entrez votre adresse email",
  enterYourPwdToConfirm: "Entrez votre mot de passe pour confirmer",
  changePwd: "Changer de mot de passe",
  existingPwd: "Mot de passe actuel",
  enterYourExistingPwd: "Entrez votre mot de passe actuel",
  newPwd: "Nouveau mot de passe",
  createNewPwd: "Créer un nouveau mot de passe",
  changeSpeechRecoLanguage: "Changer la langue de reconnaissance vocale",
  changeAppLanguage: "Changer la langue de l'application",
  logoutText: "Vous serez redirigé vers l'écran de connexion.",
  deleteAccountText:
    "La suppression de votre compte est définitive. Votre journal, les éclairages et l'intégralité de vos données associées seront effacées.",
  pleaseTypeName: "Veuillez saisir votre nom",
  pleaseTypeEmail: "Veuillez saisir votre email",
  pleaseTypeSmthg: "Veuillez saisir quelque chose",
  emailMustBeValid: "L'email doit être valide",
  pwdMustBeValid: "Le mot de passe doit contenir au moins 6 caractères",
  nameUpdated: "Nom mis à jour",
  emailUpdated: "Email mis à jour",
  pwdUpdated: "Mot de passe mis à jour",
  contactUsHtml:
    "<p>Chez KifKaf c'est notre priorité numéro 1 que de vous offrir la meilleure expérience possible.<br/> Vos retours seront toujours les bienvenus.</p><p>Quelque soit votre demande, écrivez-nous dans le formulaire ci-dessous ou envoyez-nous un email à :</p>",
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
    "👉 Préparation de votre citation en cours. Cela prend environ 2 min. | 👉 Cette citation n'est pas personnalisée. Plus qu'une note à saisir ce mois-ci pour qu'elle soit inspirée par votre journal. | 👉 Cette citation n'est pas personnalisée. Encore {count} notes à saisir ce mois-ci pour qu'elle soit inspirée par votre journal.",
};
