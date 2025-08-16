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
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Reusable helper: assert that a field screams "Required" when you ignore it.
Cypress.Commands.add("expectRequiredField", (selector) => {
  // Setup Language variables
  const uiD = Cypress.env("uiData"); // Default language bundle
  const otherUiD = Cypress.env("otherLangUiData"); // Opposite language bundle

  // focus then immediately ghost it to trigger validation.
  cy.get(selector).scrollIntoView().should("be.visible").focus();

  cy.get("body").click(0, 0); // blur by clicking away

  // Look for "Required" text near the field
  cy.get(selector)
    .parents() // go up the DOM tree
    .contains(uiD.errors.required)
    .should("be.visible");
});

//Strips digits from a field (used in phone number testcases)
Cypress.Commands.add("stripDigits", (selector) =>
  cy
    .get(selector)
    .invoke("val")
    .then((v) => v.replace(/\D/g, ""))
);
