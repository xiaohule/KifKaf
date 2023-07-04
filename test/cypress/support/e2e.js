// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your e2e test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import "./commands";
import "@cypress/code-coverage/support";

Cypress.on("uncaught:exception", (err, runnable) => {
  // we expect a 3rd party library error with message 'list not defined'
  // and don't want to fail the test so we return false
  if (
    err.message.includes(
      "Failed to fetch dynamically imported module: http://localhost:9200/src/pages/HomeTab.vue"
    )
    // ||
    // err.message.includes("ResizeObserver loop limit exceeded") ||
    // err.message.includes("cancelled")
  ) {
    return false;
  }
  // we still want to ensure there are no other unexpected
  // errors, so we let them fail the test
});
