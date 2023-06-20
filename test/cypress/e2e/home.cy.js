/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements
const seedData = require("./../fixtures/moments.json");
import { generateRandomTestEmail } from "./../support/commands.js";

describe.skip("Signing in and out", () => {
  before(() => {
    cy.toggleFirebasePersistence();
  });
  beforeEach(() => {
    cy.visit("/");
  });
  it("should let the user sign in", () => {
    cy.signIn("a@yopmail.com", "yopyopyop2");
  });
  it("should allow for tapping Log out and cancel", () => {
    cy.contains("account_circle").click();
    cy.contains("Log out").click();
    cy.contains("Cancel").click();
  });
  it("should allow for tapping Log out and confirming", () => {
    cy.contains("account_circle").click();
    cy.contains("Log out").click();
    cy.withinDialog((el) => {
      cy.wrap(el).should("contain", "screen");
      cy.dataCy("logout-button").click();
    });
  });
});

describe("Signing up > out > in", () => {
  before(() => {
    cy.toggleFirebasePersistence();
  });
  beforeEach(() => {
    cy.visit("/");
  });
  const username = generateRandomTestEmail(4) + "@yopmail.com";
  const password = "yopyopyop";
  it("should let a user sign up", () => {
    cy.signUp(username, password);
  });
  it.skip("should allow for tapping Log out and confirming", () => {
    cy.contains("account_circle").click();
    cy.contains("Log out").click();
    cy.withinDialog((el) => {
      cy.wrap(el).should("contain", "screen");
      cy.dataCy("logout-button").click();
    });
  });
  it.skip("should let the newly created user sign in", () => {
    cy.signIn(username, password);
  });
});

describe.skip("Checking basic screens", () => {
  beforeEach(() => {
    cy.visit("/");
  });
  it("assert <title> and header title are correct", () => {
    cy.title().should("include", "Quasar");
    cy.contains("KifKaf");
  });
  it("contain the expected 4 Tabs", () => {
    cy.contains("Home");
    cy.contains("Learn");
    cy.contains("Timeline");
    cy.contains("Search");
  });
  it("navigate to Learn>Home>Settings>Home", () => {
    cy.contains("Learn").click();
    cy.url().should("include", "learn");
    cy.contains("Home").click();
    cy.url().should("not.include", "learn");
    cy.contains("account_circle").click();
    cy.url().should("include", "settings");
    cy.contains("arrow_back").click();
    cy.url().should("not.include", "settings");
  });
});

describe("Moments inputting", () => {
  beforeEach(() => {
    // const now = new Date(2023, 3, 14); // month is 0-indexed
    // cy.clock(now, ["Date"]);

    cy.visit("/");
  });

  it("should seed the database pageX2", () => {
    // const now = new Date(2023, 3, 14); // month is 0-indexed

    // cy.clock(now).setSystemTime(now)
    // cy.clock(Date.UTC(2018, 10, 30), ['Date'])

    // cy.visit("/");
    // cy.get("#date").should("have.value", "04/14/2021");
    for (const item of seedData) {
      // const now = new Date(2023, 3, 14); // month is 0-indexed
      // cy.clock(now, ["Date"]);

      const now = new Date(item.date);
      cy.clock(now.getTime(), ["Date"]);

      expect(item.intensity).to.be.a("number").and.be.gte(-5).and.be.lte(5);
      cy.get(".vue-slider-rail").first().clickVSlider(item.intensity);

      const tagsString = item.tags.map((tag) => ` #${tag}`).join("");
      const fullText = `${item.text}${tagsString}`;
      cy.dataCy("new-moment-editor").type(fullText);

      cy.contains("arrow_forward").click();
      cy.contains(item.text);

      cy.clock().then((clock) => {
        clock.restore();
      });

      cy.wait(1000);
    }
  });
});

// it("should seed the database pageX", () => {
//   for (const item of seedData) {
//     let offset = null;
//     cy.get(".vue-slider-dot")
//       .first()
//       .then(($el) => {
//         offset = $el[0].getBoundingClientRect();
//         cy.log("offset.left", offset.left);
//         cy.log("offset.top", offset.top);
//         cy.get(".vue-slider-dot")
//           .first()
//           .trigger("mousedown", "center", { which: 1 })
//           .trigger("mousemove", {
//             which: 1,
//             pageX: offset.left - 100,
//             // pageY: offset.top - 100,
//           })
//           .trigger("mouseup", { which: 1, force: true });
//       });
//     cy.dataCy("new-moment-editor").type(item.text);
//     cy.contains("arrow_forward").click();
//     cy.contains(item.text);
//     cy.wait(2000);
//   }
// });

//   it.only("should seed the database 5", () => {
//     for (const item of seedData) {
//       const formattedDate = new Date(item.date);

//       // cy.window()
//       //   .its("pinia")
//       //   .invoke("_pStores")
//       //   .its("moments")
//       //   .invoke("addMoment", {
//       //     date: formattedDate,
//       //     intensity: item.intensity,
//       //     text: item.text,
//       //     tags: item.tags,
//       //   });

//       cy.window().its("testStoreActions").invoke("addMoment", {
//         date: formattedDate,
//         intensity: item.intensity,
//         text: item.text,
//         tags: item.tags,
//       });

//       // cy.window()
//       //   .its("pinia")
//       //   .invoke("useMomentsStore")
//       //   .its("moments")
//       //   .invoke("addMoment", {
//       //     date: formattedDate,
//       //     intensity: item.intensity,
//       //     text: item.text,
//       //     tags: item.tags,
//       //   });

//       // cy.window()
//       //   .its("appContext")
//       //   .invoke("useMomentsStore")
//       //   .invoke("addMoment", {
//       //     date: formattedDate,
//       //     intensity: item.intensity,
//       //     text: item.text,
//       //     tags: item.tags,
//       //   });
//       // momentsStore.addMoment({
//       //   date: formattedDate,
//       //   intensity: item.intensity,
//       //   text: item.text,
//       //   tags: item.tags,
//       // });
//     }
//   });
// });

/////////

// describe("QuasarDialog", () => {
//   it("should show a dialog with a message", () => {
//     cy.withinDialog((el) => {
//       cy.wrap(el).should("contain", message);
//       cy.dataCy("ok-button").click();
//     });
//   });
// });

// describe('Loading single fixture', () => {
//   it('loads', () => {
//     cy.fixture('moments').should('deep.equal', { name: 'Atlanta' })
//   })
// })
// https://github.com/cypress-io/cypress-example-recipes/blob/master/examples/fundamentals__fixtures/cypress/e2e/list-spec.cy.js

// ** The following code is an example to show you how to write some tests for your home page **

// describe("Home page tests", () => {
//   beforeEach(() => {
//     cy.visit("/");
//   });
//   it("has pretty background", () => {
//     cy.dataCy("landing-wrapper")
//       .should("have.css", "background")
//       .and("match", /(".+(\/img\/background).+\.png)/);
//   });
//   it("has pretty logo", () => {
//     cy.dataCy("landing-wrapper img")
//       .should("have.class", "logo-main")
//       .and("have.attr", "src")
//       .and("match", /^(data:image\/svg\+xml).+/);
//   });
//   it("has very important information", () => {
//     cy.dataCy("instruction-wrapper")
//       .should("contain", "SETUP INSTRUCTIONS")
//       .and("contain", "Configure Authentication")
//       .and("contain", "Database Configuration and CRUD operations")
//       .and("contain", "Continuous Integration & Continuous Deployment CI/CD");
//   });
// });
