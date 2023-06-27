/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements
const momentsData = require("./../fixtures/moments.json");
const momentsStats2023Data = require("./../fixtures/momentsStats2023.json");
const momentsStats2022Data = require("./../fixtures/momentsStats2022.json");

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

describe("Checking basic screens", () => {
  beforeEach(() => {
    cy.visit("/");
  });
  it("assert <title> and header title are correct", () => {
    cy.title().should("include", "Quasar");
    cy.contains("KifKaf");
  });
  it("contain the expected tabs", () => {
    cy.contains("Home");
    cy.contains("Learn");
    // cy.contains("Timeline");
    // cy.contains("Search");
  });
  it("navigate to Learn>Home>Settings>Home", () => {
    cy.contains("Learn").click();
    cy.url().should("include", "learn");
    cy.contains("Kifs").should("exist");
    cy.contains(
      "First add some Kafs in Home tab to learn about what drains you!"
    ).should("exist");
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

  it("input moments in Home and validate in Learn", () => {
    for (const item of momentsData) {
      const now = new Date(item.date);
      cy.clock(now.getTime(), ["Date"]);

      expect(item.intensity).to.be.a("number").and.be.gte(-5).and.be.lte(5);
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

    cy.contains("Learn").click();
    cy.url().should("include", "learn");

    for (const item of momentsStats2023Data) {
      cy.dataCy("learn-tab-tag-row").each(($div) => {
        cy.wrap($div).within(() => {
          if (Cypress.$($div).find(`:contains(${item.tag})`).length > 0) {
            cy.contains(item.count);
            cy.contains(parseFloat(item.avgIntensity.toFixed(1)));
          }
        });
      });
    }

    cy.contains("Kifs").parent().contains("Frequency").click();
    cy.contains("Kafs").parent().contains("Frequency").click();

    for (const item of momentsStats2023Data) {
      cy.dataCy("learn-tab-tag-row-percentShare").each(($div) => {
        cy.wrap($div).within(() => {
          if (Cypress.$($div).find(`:contains(${item.tag})`).length > 0) {
            cy.contains(parseFloat((item.percentShare * 100).toFixed(0)));
          }
        });
      });
    }
  });

  it("validate monthly picker and learn tab 2022", () => {
    cy.contains("Learn").click();
    cy.url().should("include", "learn");
    cy.contains("This year").click();
    cy.withinDialog((el) => {
      // cy.wrap(el).should("contain", "screen");
      cy.contains("Monthly").click();
      cy.contains("May").should("exist");
      cy.contains("Yearly").click();
      cy.contains("2023").should("exist");
      cy.contains("2022").click();
      cy.contains("Done").click();
    });
    cy.contains("2022").should("exist");

    for (const item of momentsStats2022Data) {
      cy.dataCy("learn-tab-tag-row").each(($div) => {
        cy.wrap($div).within(() => {
          if (Cypress.$($div).find(`:contains(${item.tag})`).length > 0) {
            cy.contains(item.count);
            cy.contains(parseFloat(item.avgIntensity.toFixed(1)));
          }
        });
      });
    }
  });

  it("validate learn tab 2021", () => {
    cy.contains("Learn").click();
    cy.url().should("include", "learn");
    cy.contains("This year").click();
    cy.contains("2021").click();
    cy.contains("Done").click();
    cy.contains("No Kifs for this period").should("exist");
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
