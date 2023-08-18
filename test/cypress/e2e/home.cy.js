/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements
const momentsData = require("./../fixtures/moments.json");
const momentsStats2023Data = require("./../fixtures/momentsStats2023.json");
const momentsStats2022Data = require("./../fixtures/momentsStats2022.json");

// import { generateRandomTestEmail } from "./../support/commands.js";

//workaround to GH actions failing
describe("Workaround GH actions", () => {
  // beforeEach(() => {
  // cy.log("Cypress.env()", JSON.stringify(Cypress.env(), null, 2));
  // cy.log(
  //   "Cypress.env('CYPRESS_APP_CHECK_DEBUG_TOKEN_FROM_CI')",
  //   Cypress.env("APP_CHECK_DEBUG_TOKEN_FROM_CI")
  // );
  // cy.wait(1000);
  // });
  it("assert <title> is correct", () => {
    cy.visit("/");
    cy.title().should("include", "KifKaf");
  });
});

describe.skip("Signing in and out", () => {
  before(() => {
    cy.toggleFirebasePersistence();
  });
  it("should let the user sign in with email & log out", () => {
    cy.visit("/");

    cy.contains("Sign in with email").click();
    cy.signIn("a@yopmail.com", "yopyopyop2");

    cy.contains("account_circle").click();
    cy.contains("Log out").click();
    cy.contains("Cancel").click();

    cy.contains("Log out").click();
    cy.withinDialog((el) => {
      cy.wrap(el).should("contain", "screen");
      cy.dataCy("logout-button").click();
    });
  });
});

describe("Navigating sign in screens & Signing up > out > in", () => {
  before(() => {
    cy.toggleFirebasePersistence();
    cy.visit("/");
  });

  // const username = generateRandomTestEmail(4) + "@yopmail.com";
  let username;
  const password = "yopyopyop";

  it("has diff. sign in options, ToS and Contact fields & let a user sign up with email, log out and sign in again", () => {
    cy.task("getUserEmail")
      .then((email) => {
        expect(email).to.be.a("string");
        console.log("EMAIL is:", email);
        // username = email;
        return email;
      })
      .as("username");

    //should have sign in options, ToS and Contact us
    cy.contains("Sign in with email").should("be.visible").click();
    cy.contains("Cancel").should("be.visible").click();
    cy.contains("Sign in with Google").should("be.visible");
    cy.contains("Terms of Service").should("be.visible").click();
    cy.contains(
      "These Terms will be applied fully and affect your use of this Website. By using this Website, you agreed to accept all terms and conditions written here.",
    );
    cy.contains("arrow_back").click();
    cy.contains("Privacy Policy").should("be.visible").click();
    cy.contains(
      "Our Privacy Policy may change from time to time. We will not reduce your rights under this Privacy Policy without your explicit consent.",
    );
    cy.contains("arrow_back").click();
    cy.contains("Contact us").should("be.visible").click();
    cy.contains("hello@kifkaf.app");
    cy.contains("Send");
    cy.contains("arrow_back").click();

    //should let a user sign up with email, log out and sign in again

    cy.contains("Sign in with email").click();
    cy.get("@username").then((username) => {
      cy.signUp(username, password);
    });
    // cy.contains("Sign in with email").click();
    // cy.get("@username").then((username) => {
    //   cy.signIn(username, password);
    // });

    cy.contains("account_circle").click();
    cy.contains("Log out").click();
    cy.withinDialog((el) => {
      cy.wrap(el).should("contain", "screen");
      cy.dataCy("logout-button").click();
    });

    // cy.visit("/login");

    cy.contains("Sign in with email").click();
    cy.get("@username").then((username) => {
      cy.signIn(username, password);
    });
  });
});

//TODO:3 in all tests that aren't testing signing in and moments input we should log in programmatically on an existing account with good data and split those tests into separate files
describe("Checking main screens & Moments inputting", () => {
  it("contain expected header, tabs, can navigate to Learn>Home>Settings>Home & can input moments in Home", () => {
    cy.visit("/");
    //assert <title> and header title are correct
    cy.title().should("include", "KifKaf");
    cy.contains("KifKaf").should("be.visible");
    //contains the expected tabs
    cy.contains("Home").should("be.visible");
    cy.contains("Learn").should("be.visible");
    // cy.contains("Timeline");
    // cy.contains("Search");
    //can navigate to Learn>Home>Settings>Home
    cy.contains("Learn").click();
    cy.url().should("include", "learn");
    cy.contains("Kifs").should("be.visible");
    cy.contains(
      "First add some Kafs in Home tab to learn about what drains you!",
    ).should("be.visible");
    cy.get("footer").contains("Home").click();
    cy.url().should("not.include", "learn");
    cy.contains("account_circle").click();
    cy.url().should("include", "settings");
    cy.contains("arrow_back").click();
    cy.url().should("not.include", "settings");

    //can input moments in Home
    cy.visit("/");
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
});

describe("Stats validation", () => {
  it("has correct stats in Learn tab for 2023, 2022, a working monthly picker and the expected placeholder for 2021", () => {
    //should have correct stats in Learn tab for 2023
    cy.visit("/");
    cy.contains("Learn").click();
    cy.url().should("include", "learn");
    cy.contains("This year").should("be.visible");
    cy.contains("Kifs").should("be.visible");
    cy.contains("Kafs");

    //expand Kifs section
    cy.get(".swiper-slide-active").first().contains("Show more").click();
    cy.get(".swiper-slide-active").then(($els) => {
      for (const item of momentsStats2023Data) {
        if ($els.first().text().includes(item.tag)) {
          // Create alias for the first swiper-slide-active
          cy.wrap($els.first()).as("firstSwiper");

          cy.get("@firstSwiper").contains(item.tag).as("firstTag");
          cy.get("@firstTag").parent().as("firstTagParent");
          cy.get("@firstTagParent").contains(item.count).as("firstCount");
          cy.get("@firstCount").parent().as("firstCountParent");
          cy.get("@firstCountParent").parent().as("firstCountGrandParent");
          cy.get("@firstCountGrandParent").contains(item.avgIntensity);
        } else {
          // Create alias for the last swiper-slide-active
          cy.wrap($els.last()).as("lastSwiper");

          cy.get("@lastSwiper").contains(item.tag).as("lastTag");
          cy.get("@lastTag").parent().as("lastTagParent");
          cy.get("@lastTagParent").contains(item.count).as("lastCount");
          cy.get("@lastCount").parent().as("lastCountParent");
          cy.get("@lastCountParent").parent().as("lastCountGrandParent");
          cy.get("@lastCountGrandParent").contains(item.avgIntensity);
        }
      }
    });

    // cy.get(".swiper-slide-active").then(($els) => {
    //   for (const item of momentsStats2023Data) {
    //     // Check if the tag exists in the first .swiper-slide-active element
    //     const foundInFirstSlide = $els.first().text().includes(item.tag);

    //     if (foundInFirstSlide) {
    //       cy.wrap($els.first())
    //         .contains(item.tag)
    //         .as("foundTag")
    //         .parent()
    //         .as("tagParent")
    //         .contains(item.count)
    //         .as("countElement")
    //         .parent()
    //         .parent()
    //         .contains(item.avgIntensity);
    //     } else {
    //       // If not found in the first .swiper-slide-active element, try the second one
    //       cy.wrap($els.last())
    //         .contains(item.tag)
    //         .as("foundTagLast")
    //         .parent()
    //         .as("tagParentLast")
    //         .contains(item.count)
    //         .as("countElementLast")
    //         .parent()
    //         .parent()
    //         .contains(item.avgIntensity);
    //     }
    //   }
    // });

    // cy.get(".swiper-slide-active").then(($els) => {
    //   for (const item of momentsStats2023Data) {
    //     cy.wrap($els.first()).within(($el) => {
    //       if ($el.text().includes(item.tag)) {
    //         cy.contains(item.tag)
    //           .parent()
    //           .contains(item.count)
    //           .parent()
    //           .parent()
    //           .contains(item.avgIntensity);
    //       } else {
    //         // If not found in the first .swiper-slide-active element, try the second one
    //         cy.wrap($els.last()).within(() => {
    //           cy.contains(item.tag)
    //             .parent()
    //             .contains(item.count)
    //             .parent()
    //             .parent()
    //             .contains(item.avgIntensity);
    //         });
    //       }
    //     });
    //   }
    // });

    cy.contains("Frequency").each(($el) => {
      cy.wrap($el).click({ force: true });
    });
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

    //should have a working monthly picker and correct stats in learn tab for 2022
    cy.visit("/");
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

    //should have the expected placeholder in learn tab for 2021
    cy.visit("/");
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
