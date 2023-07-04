// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// DO NOT REMOVE
// Imports Quasar Cypress AE predefined commands
import { registerCommands } from "@quasar/quasar-app-extension-testing-e2e-cypress";
registerCommands();
import { initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

Cypress.Commands.add("toggleFirebasePersistence", () => {
  const firebaseConfig = {
    apiKey: "AIzaSyDMydjsxDCNqYeYFbNL0q8VtzM8sXE_rXg",
    authDomain: "kifkaf-d4850.firebaseapp.com",
    projectId: "kifkaf-d4850",
    storageBucket: "kifkaf-d4850.appspot.com",
    messagingSenderId: "296402111022",
    appId: "1:296402111022:web:9e147ef8aa0fcb44822dbf",
    measurementId: "G-6KB3RTH5GX",
  };
  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);

  //APP CHECK
  self.FIREBASE_APPCHECK_DEBUG_TOKEN =
    Cypress.env("CYPRESS_APP_CHECK_DEBUG_TOKEN_FROM_CI") || true;
  console.log(
    "FIREBASE_APPCHECK_DEBUG_TOKEN from commands.js",
    self.FIREBASE_APPCHECK_DEBUG_TOKEN
  );
  const appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(
      "6Lcwc_AmAAAAALodsOgDWM_0W3Ts1yrj_SKoPEfB"
    ),
    isTokenAutoRefreshEnabled: true,
  });
  // chain the promises together with .then()
  return auth
    .signOut()
    .then(() => {
      return setPersistence(auth, inMemoryPersistence); //set persistence to none
    })
    .catch((error) => {
      // Handle the error here
      console.error("Error occurred during persistence setting:", error);
      throw error; // Rethrow the error to propagate it further
    });
  // FYI
  //local (implemented by browserLocalPersistence in Firebase JS SDK) - This persists the user session even when the browser is closed.
  // session (implemented by browserSessionPersistence in Firebase JS SDK) - This persists the user session until the browser or tab is closed.
  // none (implemented by inMemoryPersistence in Firebase JS SDK) - This keeps the user state only in memory and will be lost when the page refreshes or closes.
});

Cypress.Commands.add("signIn", (username, password) => {
  // cy.session(
  //   username,
  //   () => {
  cy.url({ timeout: 40000 }).should("include", "login");
  cy.get("input").type(username);
  cy.contains("Next").click();
  cy.get("[type='password']").type(password);
  //click on the button of type submit that contains "Sign in" text, be careful there is another element that contains text "Sign in" but it is not a button
  cy.get("button[type='submit']").click();
  cy.url({ timeout: 20000 }).should("not.include", "login");
  cy.log("Signed in as" + username + " " + password);
  // },
  //   {
  //     validate: () => {
  //       cy.getCookie("session").should("exist");
  //     },
  //   }
  // );
});

Cypress.Commands.add("signUp", (username, password) => {
  cy.url({ timeout: 20000 }).should("include", "login");
  cy.get("input").type(username);
  cy.contains("Next").click();
  cy.get("[type='text'][name='name']").type("Jane Doe");
  cy.get("[type='password']").type(password);
  cy.get("button[type='submit']").click();
  cy.url({ timeout: 20000 }).should("not.include", "login");
  cy.log("Signed up as" + username + " " + password);
});

Cypress.Commands.add(
  "clickVSlider",
  { prevSubject: true },
  (subject, intensity) => {
    const sliderWidth = subject.width();
    const sliderHeight = subject.height();
    // cy.log("sliderWidth", sliderWidth);
    // cy.log("sliderHeight", sliderHeight);
    const pixelsFromLeft = (intensity / 10 + 0.5) * sliderWidth;
    const pixelsFromTop = 0.5 * sliderHeight;
    cy.wrap(subject).click(pixelsFromLeft, pixelsFromTop, { force: true });
  }
);

export const generateRandomTestEmail = (string_length) => {
  let random_string = "test_";
  let random_ascii;
  for (let i = 0; i < string_length; i++) {
    random_ascii = Math.floor(Math.random() * 25 + 97);
    random_string += String.fromCharCode(random_ascii);
  }
  return random_string;
};

// Cypress.Commands.add("seedDatabase", () => {
//   setActivePinia(createPinia());
//   const momentsStore = useMomentsStore();

//   for (const item of seedData) {
//     const formattedDate = new Date(item.date);
//     momentsStore.addMoment({
//       date: formattedDate,
//       intensity: item.intensity,
//       text: item.text,
//       tags: item.tags,
//     });
//   }
// });
