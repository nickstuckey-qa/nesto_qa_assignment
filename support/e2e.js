// Pull in custom commands. 
import './commands'

// Catch uncaught exceptions.
// Catch provided by Nesto assignment
Cypress.on('uncaught:exception', (err) => {
  // Be specific so you don't hide real bugs
  if (err.message?.includes("Cannot read properties of null (reading 'document')")) {
    return false; // prevent test from failing
  }
});

// Load all locales
const allData = require('../fixtures/uiData.json');

// Determine locale from CLI/env. Example: npx cypress open --env locale=fr
// If nothing passed, default to 'en'
const locale = String(Cypress.env('locale') || 'en').toLowerCase();
if (!allData[locale]) {
  throw new Error(`Unknown locale "${locale}". Use either en | fr`);
}

// Determine opposite locale
const otherLocale = locale === 'en' ? 'fr' : 'en';

// Make both bundles available everywhere, because passing props is for frameworks.
Cypress.env('uiData', allData[locale]);          // current/default bundle
Cypress.env('otherLangUiData', allData[otherLocale]); // opposite bundle

// Also expose the raw codes for easy logging/asserts. Because future-you will forget.
Cypress.env('locale', locale);
Cypress.env('otherLocale', otherLocale);



// This does will start the testcase at the signup page, and accept the cookies prior to each testcase.
// In the case of when locale=fr, it will also toggle french. 
Cypress.Commands.add('initSignup', () => {
  const uiD = Cypress.env('uiData');

  // go where the test needs to be
  cy.visit(uiD.urls.signup);
  // make the cookie nag disappear so we can see the page we actually care about
  cy.contains('button', uiD.buttons.acceptCookies).click({ force: true });

  if (locale === 'fr') {
    cy.get('[data-test-id="toggle-language"]')
      .invoke('removeAttr', 'target')
      .click();
  }
});

// Before each test, show up on the signup page with cookies handled,
// unless someone explicitly sets CYPRESS_env_skipInit=true to skip the helper.
// This keeps specs lean and stops everyone from writing the same three lines 400 times.
beforeEach(() => {
  if (!Cypress.env('skipInit')) {
    cy.initSignup();
  }
});