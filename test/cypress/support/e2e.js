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
// require("cypress-terminal-report/src/installLogsCollector")();
// console.log("support/e2e.js loaded");

Cypress.on("uncaught:exception", (err, runnable) => {
  // console.log("support/e2e.js loaded2");

  // we expect a 3rd party library error with message 'list not defined'
  // and don't want to fail the test so we return false
  if (
    // err.message.includes("Failed to fetch dynamically imported module") ||
    err.message.includes("cancelled") ||
    err.message.includes("auth/network-request-failed") ||
    err.message.includes("swiperSummaryEl.value is null") ||
    err.message.includes(
      "ResizeObserver loop completed with undelivered notifications.",
    ) ||
    err.message.includes("Missing or insufficient permissions") ||
    err.message.includes("Cannot destructure property")
    // err.message.includes("Cannot read properties of null") ||
    // err.message.includes("ResizeObserver loop limit exceeded") ||
    // err.message.includes("Request failed with status code") ||
    // err.message.includes("value.initialize") ||
    // err.message.includes('"WebView" plugin')
  ) {
    return false;
  }
  // we still want to ensure there are no other unexpected
  // errors, so we let them fail the test
});
