// grab the language data from Cypress env vars so we know what text/images to expect
const uiD = Cypress.env("uiData"); // Default language bundle
const otherUiD = Cypress.env("otherLangUiData"); // Opposite language bundle
 
// ==============================================
// Image visibilty and alt text.
// ==============================================
describe("Verify UI Images are visible with alt text", () => {
  // Testcase: verifies the nesto header image is present.
  it("Verify Nesto header image is present", () => {
    //Verify Nesto Mortagage Lenders Image
    cy.get(`img[alt="${uiD.images.nesto_header}"]`)
      .should("be.visible")
      .and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });
  });

  // Testcase: verifies the nesto secure image is present.
  it("Verify Nesto secure image is present", () => {
    //Verify Nesto Secure Image
    cy.get(`img[alt="${uiD.images.nesto_secure}"]`)
      .should("be.visible")
      .and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });
  });
});

// ==============================================
// Button tests
// ==============================================
describe("Verify UI Buttons are functional", () => {
  // Testcase: the login button is visible and works.
  it("Verify header login button", () => {
    // text should match expected login label

    cy.get('[data-test-id="header-login"]')
      .contains(uiD.buttons.login)
      .should("be.visible");

    // Verify login button functionality
    cy.get('[data-test-id="header-login"]')
      .invoke("removeAttr", "target")
      .click();

    // Verify arrival at new page
    cy.url().should("include", uiD.urls.login);
  });

  //Testcase: the language button is visible and works.
  it("Verify header language button", () => {
    // Verify language button text
    cy.get('[data-test-id="toggle-language"]')
      .should("be.visible")
      .and("contain.text", uiD.buttons.language);

    // click to swap language
    cy.get('[data-test-id="toggle-language"]')
      .invoke("removeAttr", "target")
      .click();

    // after clicking, text should now come from other language bundle
    cy.contains(otherUiD.buttons.language).should("be.visible");

    // make sure URL didn't change (just language)
    cy.url().should("include", uiD.urls.signup);
  });
});

// ==============================================
// Textfields and labels
// ==============================================
describe("Verify UI Text fields and labels", () => {
  // Testcase top of the form should have the correct signup title
  it("Verify title text is present", () => {
    cy.get('[data-test-id="form_signup_title"]')
      .should("be.visible")
      .and("contain.text", uiD.text.createNestoAccount);
  });

  // Testcase: floating label text should match what we expect for first name
  it("Verify first name text fields", () => {
    // The floating label shows the right text - firstName
    cy.get('[data-test-id="input_label-firstName"]')
      .should("be.visible")
      .invoke("text")
      .then((t) => expect(t.trim()).to.eq(uiD.labels.firstName));
  });

  // Testcase: floating label text should match what we expect for last name
  it("Verify last name text fields", () => {
    // The floating label shows the right text
    cy.get('[data-test-id="input_label-lastName"]')
      .should("be.visible")
      .invoke("text")
      .then((t) => expect(t.trim()).to.eq(uiD.labels.lastName));
  });

  // Testcase: floating label text should match what we expect for email
  it("Verify email text fields", () => {
    // The email input is visible on the page
    cy.get('[data-test-id="email"]').should("be.visible");

    // The floating label shows the right text - Mobile phone number
    cy.get('[data-test-id="input_label-email"]')
      .should("be.visible")
      .invoke("text")
      .then((t) => expect(t.trim()).to.eq(uiD.labels.email));
  });

  // Testcase: help text under email field should match expected instructions
  it("Verify email instructions are present", () => {
    cy.get('[data-test-id="formWarn_passwordComplexity"]')
      .should("be.visible")
      .and("contain.text", uiD.text.emailInstructions);
  });

  // Testcase: Phone number field is visible and only contains Mobile Phone Number.
  it("Verify phone text fields", () => {
    // The Phone input is visible on the page
    cy.get('[data-test-id="phone"]').should("be.visible");

    // The floating label shows the right text - Mobile phone number
    cy.get('[data-test-id="input_label-phone"]')
      .should("be.visible")
      .invoke("text")
      .then((t) => expect(t.trim()).to.eq(uiD.labels.phone));
  });

  // Testcase: Password field is visible and only contains password.
  it("Verify password text fields", () => {
    // The input itself is on the page
    cy.get('[data-test-id="password"]').should("be.visible");

    // The floating label shows the right text - Password
    cy.get('[data-test-id="input_label-password"]')
      .should("be.visible")
      .invoke("text")
      .then((t) => expect(t.trim()).to.eq(uiD.labels.password));
  });

  // Testcase: Password confirm field is visible and only contains proper verbage.
  it("Verify password confirm text fields", () => {
    // The input itself is on the page
    cy.get('[data-test-id="passwordConfirm"]').should("be.visible");

    // The floating label shows the right text - Confirm password
    cy.get('[data-test-id="input_label-passwordConfirm"]')
      .should("be.visible")
      .invoke("text")
      .then((t) => expect(t.trim()).to.eq(uiD.labels.passwordConfirm));
  });

  // Testcase: checkbox agreement text is present.
  it("Verify checkbox agreement text is present", () => {
    cy.get('[data-test-id="getAQuote_shortPartnerAgreementAndEmail_V3"]')
      .should("be.visible")
      .and("contain.text", uiD.text.checkBoxText);
  });

  // Testcase: footer text is present.
  it("Verify page footer text is present", () => {
    cy.get('[data-test-id="createAccountAgreement"]')
      .should("be.visible")
      .and("contain.text", uiD.text.footer);
  });
});


// ==============================================
// Dropdowns
// ==============================================
describe("Verify UI dropdown lists visible, and functional", () => {
  // Testcase: Province dropdown list is visible and all provinces exist.
  // defects.txt --> DEFECT-006
  // Currently Fails.
  it("Selects each province and verifies against uiData", () => {
    // grab all province names from the language bundle
    const provincesObj = uiD.provinces;
    const provinceNames = Object.values(provincesObj);
    expect(provinceNames, "uiData provinces").to.be.an("array").and.not.be
      .empty;

    // click dropdown + select each province one by one
    provinceNames.forEach((province, index) => {
      cy.get(".react-select__control").click();
      cy.get(`#react-select-province-option-${index}`)
        .should("have.text", province)
        .click();
    });
  });
});

// ==============================================
// Checkboxes
// ==============================================
describe("Verify UI checkboxes are functional", () => {
  // Testcase: Agreement checkbox is visible and unchecked.
  it("Verify consent agreement checkbox", () => {
    const container = '[data-test-id="checkbox-container-leadDistributeConsentAgreement"]';

    cy.get(container).should("be.visible").as("consent");
    cy.get("@consent").find('input[type="checkbox"]').as("cb");

    // start: should not be checked
    cy.get("@cb")
      .should("exist")
      .and("have.length", 1)
      .and("not.be.checked");

    // check it
    cy.get("@cb").check({ force: true });

    // verify checked
    cy.get("@cb").should("be.checked");
  });
});

// ==============================================
// Links
// ==============================================
describe("Verify UI links are functional", () => {
  // Testcase: privacy policy link exists, and is valid.
  it("Verify privacy policy link exists", () => {
    const href = uiD.urls.privacyPolicy;

    // Find the terms of service link
    cy.contains("a", uiD.links.signUp_privacyPolicy) // or use data-test-id

    //Verify that the link is valid.
    cy.contains("a", uiD.links.signUp_privacyPolicy).should(
      "have.attr",
      "href",
      href
    );

    cy.request(href).its("status").should("eq", 200);
  });

  // Testcase: terms of service link exists, and is valid.
  it("Verify terms of service link exists", () => {
    const href = uiD.urls.termsOfService;

    // Find the terms of service link
    cy.contains("a", uiD.links.signUp_termsOfService) // or use data-test-id

    //Verify that the link is valid.
    cy.contains("a", uiD.links.signUp_termsOfService).should(
      "have.attr",
      "href",
      href
    );

    cy.request(href).its("status").should("eq", 200);
  });
});
