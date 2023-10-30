/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements
const momentsData = require("./../fixtures/moments.json");
// const momentsStats2023Data = require("./../fixtures/momentsStats2023.json");
// const momentsStats2022Data = require("./../fixtures/momentsStats2022.json");

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

    cy.contains("Log in").click();
    cy.contains("email").click();

    cy.signIn("a@yopmail.com", "badpassword");
    cy.contains("Incorrect").should("be.visible");
    cy.contains("KifKaf").click();
    cy.contains("arrow_back").should("be.visible").click();
    cy.contains("email").click();

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
  // let username;
  const password = "yopyopyop";

  it("has diff. sign in options, ToS and Contact fields & let a user sign up with email, log out and sign in again", () => {
    // connecting to the temporary email provider
    cy.origin("https://www.guerrillamail.com", () => {
      cy.visit("/");
      // retrieving the temporary email address
      cy.get("#inbox-id").invoke("text");
    }).as("username");

    cy.visit("/", { timeout: 60000 });
    //should have sign in options, ToS and Contact us
    cy.contains("Log in").should("be.visible").click();
    cy.contains("arrow_back").click();
    cy.contains("Log in").should("be.visible").click();
    cy.contains("Google").should("be.visible");
    cy.contains("Apple").should("be.visible");
    cy.contains("Terms of Service").should("be.visible").click();
    cy.contains("Welcome to KifKaf. These Terms of Service");
    cy.contains("arrow_back").click();
    cy.contains("Privacy Policy").should("be.visible").click();
    cy.contains("At KifKaf, your privacy is paramount");
    cy.contains("arrow_back").click();
    cy.contains("Contact us").should("be.visible").click();
    cy.contains("hello@kifkaf.app");
    cy.contains("Send");
    cy.contains("arrow_back").click();

    //should let a user sign up with email, log out and sign in again
    cy.contains("email").click();
    cy.get("@username").then((username) => {
      cy.signUp(`${username}@sharklasers.com`, password);
    });

    cy.contains("account_circle", { timeout: 40000 }).click();
    cy.contains("Log out").click();
    cy.withinDialog((el) => {
      cy.wrap(el).should("contain", "screen");
      cy.dataCy("logout-button").click();
    });

    cy.contains("Log in").click();
    cy.contains("email").click();
    cy.get("@username").then((username) => {
      cy.signIn(`${username}@sharklasers.com`, password);
    });
  });
});

//TODO:2 in all tests that aren't testing signing in and moments input we should log in programmatically on an existing account with good data and split those tests into separate files
describe("Checking main screens & Moments inputting", () => {
  it("contain expected header, tabs, can navigate to Insights>Home>Settings>Home & can input moments in Home", () => {
    cy.visit("/");
    //assert <title> and header title are correct
    cy.title().should("include", "KifKaf");
    cy.contains("Home").should("be.visible");
    //contains the expected tabs
    cy.contains("Home").should("be.visible");
    cy.contains("Insights").should("be.visible");
    //can navigate to Learn>Home>Settings>Home
    cy.contains("Insights").click();
    cy.url().should("include", "learn");
    cy.contains("Needs Importance").should("be.visible");
    cy.contains("Satisfied").should("be.visible");
    cy.contains(
      "Add Moments in the Home tab to learn more about your needs!",
    ).should("be.visible");
    cy.get("footer").contains("Home").click();
    cy.url({ timeout: 40000 }).should("not.include", "learn");
    //Settings
    cy.contains("account_circle").click();
    cy.url().should("include", "settings");
    cy.contains("Speech").should("be.visible").click();
    cy.contains("Français").should("be.visible").click();
    cy.contains("close").click();
    cy.contains("Français").should("be.visible");
    cy.contains("arrow_back").click();
    cy.url().should("not.include", "settings");

    //can input moments in Home
    cy.visit("/");
    for (const item of momentsData) {
      const now = new Date(item.date);
      cy.clock(now.getTime(), ["Date"]);
      cy.dataCy("new-moment-textarea").type(item.text);
      cy.contains("arrow_forward").click();
      cy.clock().then((clock) => {
        clock.restore();
      });
    }
    cy.wait(5000);
    for (const item of momentsData) {
      cy.contains(item.text);
    }
  });
});

describe("Insights Stats validation", () => {
  it("has correct stats in Insights tab for 2023, 2022, a working monthly picker and the expected placeholder for 2021", () => {
    //should have correct stats in Learn tab for 2023
    cy.visit("/");
    cy.contains("Insights").click();
    cy.url().should("include", "learn");
    cy.reload();
    cy.contains("This month").should("be.visible").click();
    cy.withinDialog((el) => {
      cy.contains("2023").should("be.visible");
      cy.contains("May").should("be.visible").click();
      cy.contains("Done").should("be.visible").click();
    });
    cy.wait(1000);
    //expand Needs Satisfaction section
    cy.get(".swiper-slide-active").first().contains("Show more").click();
    // cy.get(".swiper-slide-active").then(($els) => {
    //   for (const item of momentsStats2023Data) {
    //     if ($els.first().text().includes(item.tag)) {
    //       // Create alias for the first swiper-slide-active
    //       cy.wrap($els.first()).as("firstSwiper");

    //       cy.get("@firstSwiper").contains(item.tag).as("firstTag");
    //       cy.get("@firstTag").parent().as("firstTagParent");
    //       cy.get("@firstTagParent").contains(item.count).as("firstCount");
    //       cy.get("@firstCount").parent().as("firstCountParent");
    //       cy.get("@firstCountParent").parent().as("firstCountGrandParent");
    //       cy.get("@firstCountGrandParent").contains(item.avgIntensity);
    //     } else {
    //       // Create alias for the last swiper-slide-active
    //       cy.wrap($els.last()).as("lastSwiper");

    //       cy.get("@lastSwiper").contains(item.tag).as("lastTag");
    //       cy.get("@lastTag").parent().as("lastTagParent");
    //       cy.get("@lastTagParent").contains(item.count).as("lastCount");
    //       cy.get("@lastCount").parent().as("lastCountParent");
    //       cy.get("@lastCountParent").parent().as("lastCountGrandParent");
    //       cy.get("@lastCountGrandParent").contains(item.avgIntensity);
    //     }
    //   }
    // });

    cy.contains("Satisfied").each(($el) => {
      cy.wrap($el).click({ force: true });
    });
    // cy.get(".swiper-slide-active").each(($el, index, $list) => {
    //   cy.wrap($el).as("swiper");
    //   cy.get("@swiper").contains("Satisfied").as("satisfied");
    //   cy.get("@satisfied").click();
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
    //           .contains((item.percentShare * 100).toFixed(0));
    //       } else {
    //         // If not found in the first .swiper-slide-active element, try the second one
    //         cy.wrap($els.last()).within(() => {
    //           cy.contains(item.tag)
    //             .parent()
    //             .contains(item.count)
    //             .parent()
    //             .parent()
    //             .contains((item.percentShare * 100).toFixed(0));
    //         });
    //       }
    //     });
    //   }
    // });

    //should have a working monthly picker and correct stats in learn tab for 2022
    cy.visit("/");
    cy.contains("Insights").click();
    cy.url().should("include", "learn");
    cy.contains("This month").should("be.visible").click();
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
    // cy.get(".swiper-slide-active").then(($els) => {
    //   for (const item of momentsStats2022Data) {
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

    //should have the expected placeholder in learn tab for 2021
    cy.visit("/");
    cy.contains("Insights").click();
    cy.url().should("include", "learn");
    cy.contains("This month").click();
    cy.contains("Yearly").click();
    cy.contains("2021").click();
    cy.contains("Monthly").click();
    cy.contains("Sep").click();
    cy.contains("Done").click();
    cy.contains("No unsatisfied needs for this period").should("be.visible");
  });
});

// describe("Lear_nOld Stats validation", () => {
//   it("has correct stats in Learn tab for 2023, 2022, a working monthly picker and the expected placeholder for 2021", () => {
//     //should have correct stats in Learn tab for 2023
//     cy.visit("/");
//     cy.contains("Lear_nOld").click();
//     cy.url().should("include", "lear_nold");
//     cy.contains("This year").should("be.visible");
//     cy.contains("Kifs").should("be.visible");
//     cy.contains("Kafs");

//     //expand Kifs section
//     cy.get(".swiper-slide-active").first().contains("Show more").click();
//     cy.get(".swiper-slide-active").then(($els) => {
//       for (const item of momentsStats2023Data) {
//         if ($els.first().text().includes(item.tag)) {
//           // Create alias for the first swiper-slide-active
//           cy.wrap($els.first()).as("firstSwiper");

//           cy.get("@firstSwiper").contains(item.tag).as("firstTag");
//           cy.get("@firstTag").parent().as("firstTagParent");
//           cy.get("@firstTagParent").contains(item.count).as("firstCount");
//           cy.get("@firstCount").parent().as("firstCountParent");
//           cy.get("@firstCountParent").parent().as("firstCountGrandParent");
//           cy.get("@firstCountGrandParent").contains(item.avgIntensity);
//         } else {
//           // Create alias for the last swiper-slide-active
//           cy.wrap($els.last()).as("lastSwiper");

//           cy.get("@lastSwiper").contains(item.tag).as("lastTag");
//           cy.get("@lastTag").parent().as("lastTagParent");
//           cy.get("@lastTagParent").contains(item.count).as("lastCount");
//           cy.get("@lastCount").parent().as("lastCountParent");
//           cy.get("@lastCountParent").parent().as("lastCountGrandParent");
//           cy.get("@lastCountGrandParent").contains(item.avgIntensity);
//         }
//       }
//     });

//     cy.contains("Frequency").each(($el) => {
//       cy.wrap($el).click({ force: true });
//     });
//     cy.get(".swiper-slide-active").each(($el, index, $list) => {
//       cy.wrap($el).as("swiper");
//       cy.get("@swiper").contains("Frequency").as("frequency");
//       cy.get("@frequency").click();
//     });

//     cy.get(".swiper-slide-active").then(($els) => {
//       for (const item of momentsStats2023Data) {
//         cy.wrap($els.first()).within(($el) => {
//           if ($el.text().includes(item.tag)) {
//             cy.contains(item.tag)
//               .parent()
//               .contains(item.count)
//               .parent()
//               .parent()
//               .contains((item.percentShare * 100).toFixed(0));
//           } else {
//             // If not found in the first .swiper-slide-active element, try the second one
//             cy.wrap($els.last()).within(() => {
//               cy.contains(item.tag)
//                 .parent()
//                 .contains(item.count)
//                 .parent()
//                 .parent()
//                 .contains((item.percentShare * 100).toFixed(0));
//             });
//           }
//         });
//       }
//     });

//     //should have a working monthly picker and correct stats in learn tab for 2022
//     cy.visit("/");
//     cy.contains("Lear_nOld").click();
//     cy.url().should("include", "lear_nold");
//     cy.contains("This year").should("be.visible").click();
//     cy.withinDialog((el) => {
//       // cy.wrap(el).should("contain", "screen");
//       cy.contains("Monthly").should("be.visible").click();
//       cy.contains("May").should("be.visible");
//       cy.contains("Yearly").should("be.visible").click();
//       cy.contains("2023").should("be.visible");
//       cy.contains("2022").should("be.visible").click();
//       cy.contains("Done").should("be.visible").click();
//     });
//     cy.contains("2022").should("be.visible");
//     cy.get(".swiper-slide-active").then(($els) => {
//       for (const item of momentsStats2022Data) {
//         cy.wrap($els.first()).within(($el) => {
//           if ($el.text().includes(item.tag)) {
//             cy.contains(item.tag)
//               .parent()
//               .contains(item.count)
//               .parent()
//               .parent()
//               .contains(item.avgIntensity);
//           } else {
//             // If not found in the first .swiper-slide-active element, try the second one
//             cy.wrap($els.last()).within(() => {
//               cy.contains(item.tag)
//                 .parent()
//                 .contains(item.count)
//                 .parent()
//                 .parent()
//                 .contains(item.avgIntensity);
//             });
//           }
//         });
//       }
//     });

//     //should have the expected placeholder in learn tab for 2021
//     cy.visit("/");
//     cy.contains("Lear_nOld").click();
//     cy.url().should("include", "lear_nold");
//     cy.contains("This year").click();
//     cy.contains("2021").click();
//     cy.contains("Done").click();
//     cy.contains("No Kifs for this period").should("be.visible");
//   });
// });
