/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements
const momentsData = require("./../fixtures/moments.json");
const momentsStats2023Data = require("./../fixtures/momentsStats2023.json");
const momentsStats2022Data = require("./../fixtures/momentsStats2022.json");

import { generateRandomTestEmail } from "./../support/commands.js";

//workaround to GH actions failing
describe("Do nothing", () => {
  beforeEach(() => {
    cy.log("Cypress.env()", Cypress.env());
    cy.log("Cypress.env()", JSON.stringify(Cypress.env(), null, 2));
    cy.log(
      "Cypress.env('CYPRESS_APP_CHECK_DEBUG_TOKEN_FROM_CI')",
      Cypress.env("APP_CHECK_DEBUG_TOKEN_FROM_CI")
    );
    cy.log("Cypress.env('CYPRESS_RECORD_KEY')", Cypress.env("RECORD_KEY"));
    cy.wait(1000);
    cy.visit("/");
  });
  it("assert <title> is correct", () => {
    cy.title().should("include", "Quasar");
    // cy.getLogs();
  });
});

describe.skip("Signing in and out", () => {
  before(() => {
    cy.toggleFirebasePersistence();
  });
  beforeEach(() => {
    cy.visit("/");
    // cy.getLogs();
    // cy.task("getLogs").then((logs) => {
    //   cy.log("Console logs:", logs);
    //   return logs;
    // });
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
    // cy.toggleFirebasePersistence().should(() => {
    //   const firebaseApp = initializeApp(firebaseConfig);
    //   const auth = getAuth(firebaseApp);
    //   expect(auth.persistence).to.equal(inMemoryPersistence);
    // });
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

//TODO:3 in all tests that aren't testing signing in and moments input we should log in programmatically on an existing account with good data and split those tests into separate files
describe("Checking basic screens", () => {
  beforeEach(() => {
    cy.visit("/");
  });
  it("assert <title> and header title are correct", () => {
    cy.title().should("include", "Quasar");
    cy.contains("KifKaf").should("be.visible");
  });
  it("contains the expected tabs", () => {
    cy.contains("Home").should("be.visible");
    cy.contains("Learn").should("be.visible");
    // cy.contains("Timeline");
    // cy.contains("Search");
  });
  it("can navigate to Learn>Home>Settings>Home", () => {
    cy.contains("Learn").click();
    cy.url().should("include", "learn");
    cy.contains("Kifs").should("be.visible");
    cy.contains(
      "First add some Kafs in Home tab to learn about what drains you!"
    ).should("be.visible");
    cy.get("footer").contains("Home").click();
    cy.url().should("not.include", "learn");
    cy.contains("account_circle").click();
    cy.url().should("include", "settings");
    cy.contains("arrow_back").click();
    cy.url().should("not.include", "settings");
  });
});

describe("Moments inputting and stats validation", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("can input moments in Home", () => {
    for (const item of momentsData) {
      const now = new Date(item.date);
      cy.clock(now.getTime(), ["Date"]);

      cy.get(".vue-slider-rail").first().clickVSlider(item.intensity);

      const tagsString = item.tags.map((tag) => ` #${tag}`).join("");
      const fullText = `${item.text}${tagsString}`;
      cy.dataCy("new-moment-editor").type(fullText);

      cy.contains("arrow_forward").click();

      cy.clock().then((clock) => {
        clock.restore();
      });
    }

    cy.wait(1000);

    for (const item of momentsData) {
      cy.contains(item.text);
    }
  });

  it("should have correct stats in Learn tab for 2023", () => {
    cy.contains("Learn").click();
    cy.url().should("include", "learn");

    cy.contains("This year").should("be.visible");
    cy.contains("Kifs").should("be.visible");
    cy.contains("Kafs");

    //expand Kifs section
    cy.get(".swiper-slide-active").first().contains("Show more").click();

    cy.get(".swiper-slide-active").then(($els) => {
      for (const item of momentsStats2023Data) {
        cy.wrap($els.first()).within(($el) => {
          if ($el.text().includes(item.tag)) {
            cy.contains(item.tag)
              .parent()
              .contains(item.count)
              .parent()
              .parent()
              .contains(item.avgIntensity);
          } else {
            // If not found in the first .swiper-slide-active element, try the second one
            cy.wrap($els.last()).within(() => {
              cy.contains(item.tag)
                .parent()
                .contains(item.count)
                .parent()
                .parent()
                .contains(item.avgIntensity);
            });
          }
        });
      }
    });

    // cy.contains("Frequency").each(($el) => {
    //   cy.wrap($el).click({ force: true });
    // });
    cy.get(".swiper-slide-active").each(($el, index, $list) => {
      cy.wrap($el).contains("Frequency").click();
    });

    cy.get(".swiper-slide-active").then(($els) => {
      for (const item of momentsStats2023Data) {
        cy.wrap($els.first()).within(($el) => {
          if ($el.text().includes(item.tag)) {
            cy.contains(item.tag)
              .parent()
              .contains(item.count)
              .parent()
              .parent()
              .contains((item.percentShare * 100).toFixed(0));
          } else {
            // If not found in the first .swiper-slide-active element, try the second one
            cy.wrap($els.last()).within(() => {
              cy.contains(item.tag)
                .parent()
                .contains(item.count)
                .parent()
                .parent()
                .contains((item.percentShare * 100).toFixed(0));
            });
          }
        });
      }
    });
  });

  it("should have a working monthly picker and correct stats in learn tab for 2022", () => {
    cy.contains("Learn").click();
    cy.url().should("include", "learn");
    cy.contains("This year").should("be.visible").click();
    cy.withinDialog((el) => {
      // cy.wrap(el).should("contain", "screen");
      cy.contains("Monthly").should("be.visible").click();
      cy.contains("May").should("be.visible");
      cy.contains("Yearly").should("be.visible").click();
      cy.contains("2023").should("be.visible");
      cy.contains("2022").should("be.visible").click();
      cy.contains("Done").should("be.visible").click();
    });
    cy.contains("2022").should("be.visible");

    cy.get(".swiper-slide-active").then(($els) => {
      for (const item of momentsStats2022Data) {
        cy.wrap($els.first()).within(($el) => {
          if ($el.text().includes(item.tag)) {
            cy.contains(item.tag)
              .parent()
              .contains(item.count)
              .parent()
              .parent()
              .contains(item.avgIntensity);
          } else {
            // If not found in the first .swiper-slide-active element, try the second one
            cy.wrap($els.last()).within(() => {
              cy.contains(item.tag)
                .parent()
                .contains(item.count)
                .parent()
                .parent()
                .contains(item.avgIntensity);
            });
          }
        });
      }
    });
  });

  it("should have the expected placeholder in learn tab for 2021", () => {
    cy.contains("Learn").click();
    cy.url().should("include", "learn");
    cy.contains("This year").click();
    cy.contains("2021").click();
    cy.contains("Done").click();
    cy.contains("No Kifs for this period").should("be.visible");
  });
});

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
