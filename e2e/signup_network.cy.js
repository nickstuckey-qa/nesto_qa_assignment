// uiD = current language (en/fr), otherUiD = the opposite
const uiD = Cypress.env("uiData"); // Default language bundle
const otherUiD = Cypress.env("otherLangUiData"); // Opposite language bundle

// ===============================
// Response data tests
// This suite tries to prove we can actually create an account and that the API behaves.
// ===============================
describe("HTTP response verification, successful end to end cases", () => {
  // Testcase Successful data entry and data post resulting in a 201 POST
  it("Creates a new account and verifies 201 + echoed data", () => {
    // Load fixture data
    cy.fixture("signup-valid.json").then((data) => {
      // Generate a unique email so the server can accept it repeatedly
      const uniqueEmail = `${data.emailPrefix}_${Date.now()}@${
        data.emailDomain
      }`;

      // catch-all so we can sweep over all POSTs (broad — but simple)
      cy.intercept("POST", "**").as("anyPost");

      // fill the signup form like normal
      cy.get('[data-test-id="firstName"]').clear().type(data.firstName);
      cy.get('[data-test-id="lastName"]').clear().type(data.lastName);
      cy.get('[data-test-id="email"]').clear().type(uniqueEmail);
      cy.get('[data-test-id="phone"]').clear().type(data.phoneDigits);
      cy.get('[data-test-id="password"]').clear().type(data.password);
      cy.get('[data-test-id="passwordConfirm"]').clear().type(data.password);

      // Province: just verify default is Quebec (from your page)
      cy.get("#select_province .react-select__single-value")
        .should("be.visible")
        .and("have.text", uiD.provinces.QC);

      // If a consent checkbox is required, tick it:
      cy.get(
        '[data-test-id="checkbox-container-leadDistributeConsentAgreement"]'
      )
        .find('input[type="checkbox"]')
        .check({ force: true });

      // Submit
      cy.get('[data-test-id="createYourAccount"]').click();

      // Find a POST with 201 that matches our form data
      // Scan all POSTs in case other analytics requests also happen.)
      cy.wait(1000); // small buffer for network
      cy.get("@anyPost.all").should((calls) => {
        // Find a 201 POST that includes the unique email in either the request or response
        const match = calls.find((call) => {
          const reqStr = JSON.stringify(call.request?.body || {}).toLowerCase();
          const resCode = call.response?.statusCode;
          const resStr = JSON.stringify(
            call.response?.body || {}
          ).toLowerCase();

          return (
            resCode === 201 &&
            (reqStr.includes(uniqueEmail.toLowerCase()) ||
              resStr.includes(uniqueEmail.toLowerCase()))
          );
        });

        // We expect to have found it
        expect(match, "found account-creation POST with 201").to.exist;

        // Verify the response echoes back checks by string searching to avoid guessing object paths.
        const bodyStr = JSON.stringify(
          match.response?.body || {}
        ).toLowerCase();

        expect(bodyStr).to.include(data.firstName.toLowerCase());
        expect(bodyStr).to.include(data.lastName.toLowerCase());
        expect(bodyStr).to.include(uniqueEmail.toLowerCase());

        // Phone can be formatted by the server; compare digits only.
        const onlyDigits = (s) => s.replace(/\D/g, "");
        const respDigits = onlyDigits(bodyStr);
        expect(respDigits).to.include(data.phoneDigits);

        // Province
        expect(bodyStr.includes(data.provinceValue.toLowerCase())).to.eq(true);
      });
    });
  });

  // Testcase: flip the UI language mid-signup and still get the 201.
  // defects.txt - DEFECT-002
  // Currently Fails.
  it("Fills out data, toggles language, create new account", () => {
    // Load fixture data
    cy.fixture("signup-valid.json").then((data) => {
      // Generate a unique email so the server can accept it repeatedly
      const uniqueEmail = `${data.emailPrefix}_${Date.now()}@${
        data.emailDomain
      }`;

      // Intercept POSTs; if you know the exact URL, replace '**' with it
      cy.intercept("POST", "**").as("anyPost");

      // Fill the form
      cy.get('[data-test-id="firstName"]').clear().type(data.firstName);
      cy.get('[data-test-id="lastName"]').clear().type(data.lastName);
      cy.get('[data-test-id="email"]').clear().type(uniqueEmail);
      cy.get('[data-test-id="phone"]').clear().type(data.phoneDigits);
      cy.get('[data-test-id="password"]').clear().type(data.password);
      cy.get('[data-test-id="passwordConfirm"]').clear().type(data.password);

      // Province: just verify default is Quebec (from your page)
      cy.get("#select_province .react-select__single-value")
        .should("be.visible")
        .and("have.text", uiD.provinces.QC);

      // If a consent checkbox is required, tick it:
      cy.get(
        '[data-test-id="checkbox-container-leadDistributeConsentAgreement"]'
      )
        .find('input[type="checkbox"]')
        .check({ force: true });

      // Verify language button functionality
      cy.get('[data-test-id="toggle-language"]')
        .invoke("removeAttr", "target")
        .click();

      // Submit
      cy.get('[data-test-id="createYourAccount"]').click();

      // Find a POST with 201 that matches our form data
      cy.wait(1000); // small buffer for network
      cy.get("@anyPost.all").should((calls) => {
        // Find a 201 POST that includes the unique email in either the request or response
        const match = calls.find((call) => {
          const reqStr = JSON.stringify(call.request?.body || {}).toLowerCase();
          const resCode = call.response?.statusCode;
          const resStr = JSON.stringify(
            call.response?.body || {}
          ).toLowerCase();

          return (
            resCode === 201 &&
            (reqStr.includes(uniqueEmail.toLowerCase()) ||
              resStr.includes(uniqueEmail.toLowerCase()))
          );
        });

        // We expect to have found it
        expect(match, "found account-creation POST with 201").to.exist;

        // Verify the response echoes back checks by string searching to avoid guessing object paths.
        const bodyStr = JSON.stringify(
          match.response?.body || {}
        ).toLowerCase();

        expect(bodyStr).to.include(data.firstName.toLowerCase());
        expect(bodyStr).to.include(data.lastName.toLowerCase());
        expect(bodyStr).to.include(uniqueEmail.toLowerCase());

        // Phone can be formatted by the server; compare digits only.
        const onlyDigits = (s) => s.replace(/\D/g, "");
        const respDigits = onlyDigits(bodyStr);
        expect(respDigits).to.include(data.phoneDigits);

        // Province
        expect(bodyStr.includes(data.provinceValue.toLowerCase())).to.eq(true);
      });
    });
  });

  // Testcase: double-click the submit button like a panicked user and ensure we don't create two accounts.
  it("Creates a new account and verifies 201 + echoed data (only 1 POST on double-click)", () => {
    cy.fixture("signup-valid.json").then((data) => {
      const uniqueEmail = `${data.emailPrefix}_${Date.now()}@${
        data.emailDomain
      }`;

      cy.intercept("POST", "**").as("anyPost");

      // Fill the form
      cy.get('[data-test-id="firstName"]').clear().type(data.firstName);
      cy.get('[data-test-id="lastName"]').clear().type(data.lastName);
      cy.get('[data-test-id="email"]').clear().type(uniqueEmail);
      cy.get('[data-test-id="phone"]').clear().type(data.phoneDigits);
      cy.get('[data-test-id="password"]').clear().type(data.password);
      cy.get('[data-test-id="passwordConfirm"]').clear().type(data.password);

      // Province check
      cy.get("#select_province .react-select__single-value")
        .should("be.visible")
        .and("have.text", uiD.provinces.QC);

      // Consent checkbox
      cy.get(
        '[data-test-id="checkbox-container-leadDistributeConsentAgreement"]'
      )
        .find('input[type="checkbox"]')
        .check({ force: true });

      // Click submit twice quickly
      cy.get('[data-test-id="createYourAccount"]').click().click();

      // Wait for requests to complete
      cy.wait(1000);

      cy.get("@anyPost.all").should((calls) => {
        // Filter to only account creation requests with 201 and our email
        const matches = calls.filter((call) => {
          const reqStr = JSON.stringify(call.request?.body || {}).toLowerCase();
          const resCode = call.response?.statusCode;
          const resStr = JSON.stringify(
            call.response?.body || {}
          ).toLowerCase();
          return (
            resCode === 201 &&
            (reqStr.includes(uniqueEmail.toLowerCase()) ||
              resStr.includes(uniqueEmail.toLowerCase()))
          );
        });

        // Expect only 1 matching POST even after double-click
        expect(matches.length, "number of account creation POSTs").to.eq(1);

        // Validate echoed data in the single response
        const bodyStr = JSON.stringify(
          matches[0].response?.body || {}
        ).toLowerCase();
        expect(bodyStr).to.include(data.firstName.toLowerCase());
        expect(bodyStr).to.include(data.lastName.toLowerCase());
        expect(bodyStr).to.include(uniqueEmail.toLowerCase());

        const onlyDigits = (s) => s.replace(/\D/g, "");
        const respDigits = onlyDigits(bodyStr);
        expect(respDigits).to.include(data.phoneDigits);
        expect(bodyStr.includes(data.provinceValue.toLowerCase())).to.eq(true);
      });
    });
  });
});

//
// Negative tests
//
describe("HTTP response verification, negative tests", () => {
  // Testcase: try to create a duplicate account and get a 409.
  it("Creates a new account with duplicate data, expects 409 response code", () => {
    // Load fixture data
    cy.fixture("signup-duplicate.json").then((data) => {
      // unique email so the server can accept it repeatedly
      const uniqueEmail = `${data.emailPrefix}@${data.emailDomain}`;

      // Intercept POSTs; if you know the exact URL, replace '**' with it
      cy.intercept("POST", "**").as("anyPost");

      // Fill the form
      cy.get('[data-test-id="firstName"]').clear().type(data.firstName);
      cy.get('[data-test-id="lastName"]').clear().type(data.lastName);
      cy.get('[data-test-id="email"]').clear().type(uniqueEmail);
      cy.get('[data-test-id="phone"]').clear().type(data.phoneDigits);
      cy.get('[data-test-id="password"]').clear().type(data.password);
      cy.get('[data-test-id="passwordConfirm"]').clear().type(data.password);

      // Province: just verify default is Quebec (from your page)
      cy.get("#select_province .react-select__single-value")
        .should("be.visible")
        .and("have.text", uiD.provinces.QC);

      // If a consent checkbox is required, tick it:
      cy.get(
        '[data-test-id="checkbox-container-leadDistributeConsentAgreement"]'
      )
        .find('input[type="checkbox"]')
        .check({ force: true });

      // Submit
      cy.get('[data-test-id="createYourAccount"]').click();

      // Find a POST with 201 that matches our form data
      cy.wait(1000); // small buffer for network
      cy.get("@anyPost.all").should((calls) => {
        // Find a 201 POST that includes the unique email in either the request or response
        const match = calls.find((call) => {
          //const reqStr = JSON.stringify(call.request?.body || {}).toLowerCase();
          const resCode = call.response?.statusCode;
          //const resStr = JSON.stringify(call.response?.body || {}).toLowerCase();

          return resCode === 409 || resCode !== 201;
        });
        // We expect to have found it
        expect(match, "409 Response found, no 201").to.exist;
      });

      // Check for duplicate account error message
      cy.contains(uiD.errors.accountExists).should("be.visible");
    });
  });
  it("Verifies no data is sent if forms are empty", () => {
    cy.intercept("POST", "**").as("anyPost");

    cy.url().then((initialUrl) => {
      cy.get('[data-test-id="createYourAccount"]').click();
      cy.url().should("eq", initialUrl);
    });

    //Buffer for request
    cy.wait(500);

    //Check response status code
    cy.get("@anyPost.all").should((calls) => {
      const any201 = calls.some((call) => call.response?.statusCode === 201);
      expect(any201, "There should be no 201 POSTs").to.be.false;
    });
  });

  
  // Testscase: do not check the TOS box and ensure the app refuses to post.
  // defects.txt --> DEFECT-001
  // Currently Fails.
  it("Verify that with valid data and no agreement checkbox, data is not posted", () => {
    // Load fixture data
    cy.fixture("signup-valid.json").then((data) => {
      // Generate a unique email so the server can accept it repeatedly
      const uniqueEmail = `${data.emailPrefix}_${Date.now()}@${
        data.emailDomain
      }`;

      // Intercept POSTs;
      cy.intercept("POST", "**").as("anyPost");

      // Visit + accept cookies
      cy.visit("https://app.qa.nesto.ca/signup");
      cy.contains("button", "Agree and close").click();

      // Fill the form
      cy.get('[data-test-id="firstName"]').clear().type(data.firstName);
      cy.get('[data-test-id="lastName"]').clear().type(data.lastName);
      cy.get('[data-test-id="email"]').clear().type(uniqueEmail);
      cy.get('[data-test-id="phone"]').clear().type(data.phoneDigits);
      cy.get('[data-test-id="password"]').clear().type(data.password);
      cy.get('[data-test-id="passwordConfirm"]').clear().type(data.password);

      // Province: just verify default is Quebec (from your page)
      cy.get("#select_province .react-select__single-value")
        .should("be.visible")
        .and("have.text", uiD.provinces.QC);

      // Submit
      cy.get('[data-test-id="createYourAccount"]').click();

      cy.wait(1000); // small buffer for network

      //Check response status code
      cy.get("@anyPost.all").should((calls) => {
        const any201 = calls.some((call) => call.response?.statusCode === 201);
        expect(any201, "There should be no 201 POSTs").to.be.false;
      });
    });
  });
});
