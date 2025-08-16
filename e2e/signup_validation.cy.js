// uiD = current language (en/fr), otherUiD = the opposite
const uiD = Cypress.env("uiData"); // Default language bundle
const otherUiD = Cypress.env("otherLangUiData"); // Opposite language bundle

// ===============================
// Text field validation testing
// ===============================
describe("Error validation on fields", () => {
  // Testscase: sanity check: when you leave fields blank and blur/submit, they should scream "Required"
  it("shows Required when fields are left empty", () => {
    // Cycle each field with the same helper
    cy.expectRequiredField("#firstName");
    cy.expectRequiredField("#lastName");
    cy.expectRequiredField("#email");
    cy.expectRequiredField("#phone");
    cy.expectRequiredField("#password");
    cy.expectRequiredField("#passwordConfirm");
  });

  // Testscase: digits in firstName should be blocked.
  // Not implemented on the app yet ().
  // Keeping the test here so we remember to unskip later.
  // defects.txt - DEFECT-005
  it.skip("Verify digits in first name field error handling", () => {
    // Enter a first name with numbers
    cy.get('[data-test-id="firstName"]').type("Jim123");

    // Click away to trigger validation
    cy.get('[data-test-id="lastName"]').click();

    // Check for visible error message near the first name field
    cy.get('[data-test-id="firstName"]')
      .parents("div")
      .find(".error-message") //To update once validation is added.
      .should("be.visible");
  });

  // Testscase: digits in lastName should be blocked.
  // Not implemented on the app yet ().
  // Keeping the test here so we remember to unskip later.
  // defects.txt - DEFECT-005
  it.skip("Verify digits in last name field error handling", () => {
    // Enter a last name with numbers
    cy.get('[data-test-id="lastName"]').type("Tester678");

    cy.get('[data-test-id="firstName"]').click();

    // Check for visible error message near the last name field
    cy.get('[data-test-id="lastName"]')
      .parents("div")
      .find(".error-message") //To update once validation is added.
      .should("be.visible");
  });

  // Testscase: firstName too long = app should show the “too many chars” message
  it("Verify too many characters in first name field error handling", () => {
    // Enter a first name with too many characters
    cy.get('[data-test-id="firstName"]').type(
      "HelloMyNameIsRickyTheQATesterAndThisIsMyVeryVeryVeryLongFirstNameLetsSeeIfThisWorks"
    );

    cy.get('[data-test-id="lastName"]').click();

    // app shows errors in a dedicated container under the field
    cy.get('[data-test-id="form-error-firstName"]') // fixed selector
      .find('[data-test-id="validation_errors_tooLong"]')
      .should("be.visible")
      .and("contain", uiD.errors.tooManyChars); // verify text
  });

  // Testscase: lastName too long = app should show the “too many chars” message
  it("Verify too many characters in last name field error handling", () => {
    // Enter a last name with too many characters
    cy.get('[data-test-id="lastName"]').type(
      "HelloMyNameIsRickyTheQATesterAndThisIsMyVeryVeryVeryLonglastNameLetsSeeIfThisWorks"
    );

    cy.get('[data-test-id="firstName"]').click();

    // app shows errors in a dedicated container under the field
    cy.get('[data-test-id="form-error-lastName"]')
      .find('[data-test-id="validation_errors_tooLong"]')
      .should("be.visible")
      .and("contain", uiD.errors.tooManyChars); // verify text
  });

  // Testscase:  email malformed = app should show the invalid email message
  it("Verify malformed email error handling", () => {
    // Type in an invalid email
    cy.get('[data-test-id="email"]').clear().type("test@test").blur();

    // Verify error is shown
    cy.contains(uiD.errors.invalidEmail).should("be.visible");
  });

  // Testscase:  email malformed missing @ = app should show the invalid email message
  it("verify email is missing @ error handling", () => {
    // Type in an invalid email
    cy.get('[data-test-id="email"]').clear().type("testingemail.cp").blur();

    // Verify error is shown
    cy.contains(uiD.errors.invalidEmail).should("be.visible");
  });

  // Testscase: Overly long email: app should cap/complain.
  it("Verify too long email error handling", () => {
    const longEmail =
      "sooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo@long.com";
    cy.get('[data-test-id="email"]').clear().type(longEmail).blur();

    // Assert your app’s inline error message
    cy.contains(uiD.errors.tooManyChars).should("be.visible");
  });

  // Testscase: Phone validation should complain if there are fewer than 10 digits
  // Not implemented yet so we're skipping until then
  // defects.txt - DEFECT-004
  it.skip("Verify phone number is 10 digits error handling", () => {
    // Check if phone number less than 10 digits is rejected
    cy.get('[data-test-id="phone"]').clear().type("514123"); // < 10 digits
    cy.get('[data-test-id="phone"]').blur();

    // If there's a custom inline error
    cy.contains(uiD.errors.invalidPhone).should("be.visible");
  });

  // Testscase: Phone mask/formatter should not allow >10 digits to “stick”.
  // We type 15 and expect only the first 10 digits to remain.
  it("Verify phone number won't accept more than 10 characters error handling", () => {
    // Type a long phone number (15 digits)
    cy.get('[data-test-id="phone"]')
      .clear()
      .type("123456789012345", { delay: 100 }) // 15 digits
      .blur()
      .invoke("val")
      .then((v) => expect(v.replace(/\D/g, "")).to.eq("1234567890"));

    // Assert no error message appears for phone field, only first 10 digits should apply.
    cy.get('[data-test-id="phone"]')
      .parents("div")
      .find(".error-message")
      .should("not.exist");
  });
});

// ===============================
// Password strength rules
// ===============================
describe("Validated password strength rules", () => {
  const passInput = '[data-test-id="password"]';
  const confirmInput = '[data-test-id="passwordConfirm"]';
  const warn = '[data-test-id="formWarn_passwordComplexity"]';

  // Helper so tests read nicer; blur is required because validation runs on “field exit”
  function typePassword(pwd) {
    cy.get(passInput).clear().type(pwd).blur();
  }

  // Quick shorthands for weak/ok states
  function expectWeak() {
    cy.get('[data-test-id="validation_errors_passwordsTooWeak"]').should(
      "be.visible",
      uiD.errors.weakPassword
    );
  }

  function expectNotWeak() {
    cy.get('[data-test-id="validation_errors_passwordsTooWeak"]').should(
      "not.exist"
    );
  }

  // Testcase: <= 11 chars should fail (we require 12+)
  it("Fails when password is too short (<12 chars)", () => {
    const pwd = "Ab1Ab1Ab1Ab"; // invalid too short
    typePassword(pwd);
    expectWeak();
  });

  // Testcase: requires at least one digit
  it("Fails when missing a digit", () => {
    const pwd = "AbAbAbAbAbAb"; //invalid missing a digit
    typePassword(pwd);
    expectWeak();
  });

  // Testcase: requires at least one lowercase
  it("Fails when missing a lowercase letter", () => {
    const pwd = "AAAAAAAAAA1A"; // 12 chars, no lowercase
    typePassword(pwd);
    expectWeak();
  });

  // Testcase: requires at least one uppercase
  it("Fails when missing an uppercase letter", () => {
    const pwd = "bbbbbbbbbb2b"; // 12 chars, no uppercase
    typePassword(pwd);
    expectWeak();
  });

  // Testcase: weird symbols shouldn’t break validation (set #1)
  it("Password validation passes with specials set #1 (!@#$%^&*()_+=-{}[])", () => {
    const pwd = "!@#$%^&*()_+=-{}[]aB1"; // special characters
    typePassword(pwd);
    expectNotWeak();
  });

  // Testcase: weird symbols shouldn’t break validation (set #2)
  it("Password validation passes with specials set #2 (|\\:;\"'<>,.?/`~)", () => {
    const pwd = "|\\:;\"'<>,.?/`~cD2"; // valid
    typePassword(pwd);
    expectNotWeak();
  });

  // Testcase: confirm field should show “passwords must match” when they… don’t
  it("Verifies handling of mismatched passwords", () => {
    const pwd = "GoodPass1234"; // valid
    const wrongPwd = "WrongPass1234"; // valid but mismatch

    //Insert into text into confirm password field
    cy.get(confirmInput).clear().type(wrongPwd).blur();
    cy.get('[data-test-id="validation_errors_passwordsMustMatch"]').should(
      "be.visible",
      uiD.errors.mistmatchPassword
    );
  });
});

// ==============================================
// Trimming checks (make sure server gets trimmed)
// ==============================================
// We send spaces in firstName/lastName/email and then sniff the POST/201 response
// to make sure the server ultimately sees the TRIMMED values. We search both request+response
// because BE may echo or transform fields. 201 = account created.
// Testcase: leading / trailing spaces in the first name fieldf should be trimmed before POST.
describe("Validate leading and trailing spaces are not in the POST", () => {
  it("Verifies that first name lead and trail spaces are not included in post", () => {
    // Load fixture data
    cy.fixture("signup-valid.json").then((data) => {
      // Generate a unique email so the server can accept it repeatedly
      const uniqueEmail = `${data.emailPrefix}_${Date.now()}@${
        data.emailDomain
      }`;

      // catch-all so we can sweep over all POSTs (broad — but simple)
      cy.intercept("POST", "**").as("anyPost");

      // cram spaces into firstName only; rest of fields are normal
      cy.get('[data-test-id="firstName"]')
        .clear()
        .type("         MyFirstName         ");
      cy.get('[data-test-id="lastName"]').clear().type(data.lastName);
      cy.get('[data-test-id="email"]').clear().type(uniqueEmail);
      cy.get('[data-test-id="phone"]').clear().type(data.phoneDigits);
      cy.get('[data-test-id="password"]').clear().type(data.password);
      cy.get('[data-test-id="passwordConfirm"]').clear().type(data.password);

      // Check province
      cy.get("#select_province .react-select__single-value")
        .should("be.visible")
        .and("have.text", uiD.provinces.QC);

      // Check check box
      cy.get(
        '[data-test-id="checkbox-container-leadDistributeConsentAgreement"]'
      )
        .find('input[type="checkbox"]')
        .check({ force: true });

      // Submit
      cy.get('[data-test-id="createYourAccount"]').click();

      // Find a POST with 201 that matches form data
      cy.wait(1000); // small buffer
      cy.get("@anyPost.all").should((calls) => {
        // Find the “right” POST (201 + contains our email somewhere)
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

        // Verify the response, check by string searching to avoid guessing paths.
        const bodyStr = JSON.stringify(
          match.response?.body || {}
        ).toLowerCase();

        expect(bodyStr).to.include(data.firstName.toLowerCase());
      });
    });
  });

  // Testcase: leading / trailing spaces in the last name field should be trimmed before POST.
  it("Verifies that lastname lead and trail spaces are not included in post", () => {
    // Load fixture data
    cy.fixture("signup-valid.json").then((data) => {
      // Generate a unique email so the server can accept it repeatedly
      const uniqueEmail = `${data.emailPrefix}_${Date.now()}@${
        data.emailDomain
      }`;

      // Intercept POSTs
      cy.intercept("POST", "**").as("anyPost");

      // Fill the form with extra spaces in last name
      cy.get('[data-test-id="firstName"]').clear().type(data.firstName);
      cy.get('[data-test-id="lastName"]')
        .clear()
        .type("        MyLastName        ");
      cy.get('[data-test-id="email"]').clear().type(uniqueEmail);
      cy.get('[data-test-id="phone"]').clear().type(data.phoneDigits);
      cy.get('[data-test-id="password"]').clear().type(data.password);
      cy.get('[data-test-id="passwordConfirm"]').clear().type(data.password);

      // Check province
      cy.get("#select_province .react-select__single-value")
        .should("be.visible")
        .and("have.text", uiD.provinces.QC);

      // Check consent checkbox
      cy.get(
        '[data-test-id="checkbox-container-leadDistributeConsentAgreement"]'
      )
        .find('input[type="checkbox"]')
        .check({ force: true });

      // Submit
      cy.get('[data-test-id="createYourAccount"]').click();

      // Find a POST with 201 that matches our form data
      cy.wait(1000); // small buffer
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

        // Verify the response, check by string searching to avoid guessing paths.
        const bodyStr = JSON.stringify(
          match.response?.body || {}
        ).toLowerCase();

        expect(bodyStr).to.include(data.lastName.toLowerCase());
      });
    });
  });

  // Testcase: leading / trailing spaces in the phone field should be trimmed before POST.
  it("Verifies that phone lead and trail spaces are not included in post", () => {
    // Load fixture data
    cy.fixture("signup-valid.json").then((data) => {
      // Generate a unique email so the server can accept it repeatedly
      const uniqueEmail = `                ${data.emailPrefix}_${Date.now()}@${
        data.emailDomain
      }`;
      const trimmedEmail = uniqueEmail.trim();

      // Intercept POSTs
      cy.intercept("POST", "**").as("anyPost");

      // Fill the form with extra spaces in last name
      cy.get('[data-test-id="firstName"]').clear().type(data.firstName);
      cy.get('[data-test-id="lastName"]').clear().type(data.lastName);
      cy.get('[data-test-id="email"]').clear().type(uniqueEmail);
      cy.get('[data-test-id="phone"]').clear().type(data.phoneDigits);
      cy.get('[data-test-id="password"]').clear().type(data.password);
      cy.get('[data-test-id="passwordConfirm"]').clear().type(data.password);

      // Check province
      cy.get("#select_province .react-select__single-value")
        .should("be.visible")
        .and("have.text", uiD.provinces.QC);

      // Check consent checkbox
      cy.get(
        '[data-test-id="checkbox-container-leadDistributeConsentAgreement"]'
      )
        .find('input[type="checkbox"]')
        .check({ force: true });

      // Submit
      cy.get('[data-test-id="createYourAccount"]').click();

      // Find a POST with 201 that matches our form data
      cy.wait(1000); // small buffer
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
            (reqStr.includes(trimmedEmail.toLowerCase()) ||
              resStr.includes(trimmedEmail.toLowerCase()))
          );
        });

        // We expect to have found it
        expect(match, "found account-creation POST with 201").to.exist;

        // Verify the response, check by string searching to avoid guessing paths.
        const bodyStr = JSON.stringify(
          match.response?.body || {}
        ).toLowerCase();

        expect(bodyStr).to.include(trimmedEmail.toLowerCase());
      });
    });
  });
});
