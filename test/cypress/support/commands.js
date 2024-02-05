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

  let firebaseWebApp;
  let auth;
  try {
    firebaseWebApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseWebApp);
  } catch (error) {
    console.error(
      "In command.js, error initializing firebaseWebApp or auth:",
      error,
    );
  }
  //APP CHECK
  self.FIREBASE_APPCHECK_DEBUG_TOKEN =
    Cypress.env("APP_CHECK_DEBUG_TOKEN_FROM_CI") || true;
  try {
    const appCheck = initializeAppCheck(firebaseWebApp, {
      provider: new ReCaptchaV3Provider(
        "6Lcwc_AmAAAAALodsOgDWM_0W3Ts1yrj_SKoPEfB",
      ),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    console.error("In command.js, Error initializing app check:", error);
  }

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
  cy.url({ timeout: 40000 }).should("include", "login");
  cy.get("input").type(username);
  cy.contains("Continue").click();
  cy.get("[type='password']").type(password);
  //click on the button of type submit that contains "Sign in" text, be careful there is another element that contains text "Sign in" but it is not a button
  cy.get("button[type='submit']").click();
  // cy.url({ timeout: 20000 }).should("not.include", "login");
  cy.contains("Journal").should("be.visible");
  cy.log("Signed in as " + username + " " + password);
});

Cypress.Commands.add("signUp", (username, password) => {
  cy.url({ timeout: 40000 }).should("include", "login");
  cy.dataCy("email-input").type(username);
  cy.contains("Continue").click();
  cy.get("[type='text'][name='name']").type("Jane Doe");
  cy.get("[type='password']").type(password);
  cy.get("button[type='submit']").click();
  cy.contains(
    "Please check your inbox and click on the link in the email to verify your account.",
  ).should("be.visible");
  cy.log("Verification email sent for " + username + " " + password);
  // cy.wait(5000);
  const usernameHandle = username.split("@")[0];
  cy.origin(
    "https://www.guerrillamail.com",
    { args: { usernameHandle } },
    ({ usernameHandle }) => {
      cy.visit("/");
      // retrieving the temporary email address
      cy.get("#inbox-id").click({ force: true });
      cy.get("#inbox-id > input").type(usernameHandle);
      cy.contains("Set").click({ force: true });
      cy.wait(1000);
      cy.reload(true);

      cy.contains("kifkaf", { timeout: 120000 })
        .should("be.visible")
        .click({ force: true })
        .then(() => {
          // clicking the authentication link contained in the body of the email
          // cy.get(".email_body a").first().click();
          cy.get(".email_body a").first().invoke("attr", "href");
        });
    },
  ).as("verificationLink");
  cy.get("@verificationLink").then((verificationLink) => {
    const url = new URL(verificationLink);
    const origin = url.origin; // for cy.origin
    cy.origin(
      origin,
      { args: { verificationLink } },
      ({ verificationLink }) => {
        cy.visit(verificationLink);
        cy.contains("Your email has been verified").should("be.visible");
      },
    );
  });

  cy.visit("/login/email");
});

// export const generateRandomTestEmail = (string_length) => {
//   let random_string = "test_";
//   let random_ascii;
//   for (let i = 0; i < string_length; i++) {
//     random_ascii = Math.floor(Math.random() * 25 + 97);
//     random_string += String.fromCharCode(random_ascii);
//   }
//   return random_string;
// };

// Cypress.Commands.add("seedDatabase", () => {
//   setActivePinia(createPinia());
//   const ms = useMomentsStore();

//   for (const item of seedData) {
//     const formattedDate = new Date(item.date);
//     ms.addMoment({
//       date: formattedDate,
//       intensity: item.intensity,
//       text: item.text,
//       tags: item.tags,
//     });
//   }
// });
