Nesto QA Technical Assignment -
Nick Stuckey
nickstuckey@gmail.com / 514-884-8638

System requirements
- Node: 18.x or 20.x
- Cypress: 13.x (10+ folder layout)
- OS/Browser verified: Windows 10/11, Chrome, Edge, Firefox 

In this package contain the files required to run the automated suite against the Nesto demo application. There are 5 expected failures due to existing issue with the demo page. 
Once those issues are resolved the tests should pass. List of failing cases:
    signup_network.cy.js
        Testcase: flip the UI language mid-signup and still get the 201. - DEFECT-002
        Testcase: do not check the TOS box and ensure the app refuses to post. - DEFECT-001
    signup_validation.cy.js
        Testcase: digits in first name field error handling - DEFECT-005
        Testcase: digits in last name field error handling  - DEFECT-005
        Testscase: Phone validation should complain if there are fewer than 10 digits - DEFECT-004

Important files included:
    e2e:
        -signup_network.cy.js - Contains the testcases verifing successful / negative POSTs.
        -signup_ui.cy.js - Basic UI testing.
        -signup_validation.cy.js - Validation testing of the UI.
    
    fixtures:
        uiData.json - Text, keys, links, buttons, etc in both EN/FR
        signup-valid.json - Valid signup data
        signup-duplicate.json - Duplicate signup data
        signup-incomplete.json - Incomplete signup data

    support:
        commands.js - Customer helpers
        e2e.js - global test bootstrap.

    defects.txt - List of observed defects / issues.
        Detail are in the .txt file however high level list of issues include:
            DEFECT-001 User creation is successful even though agreement check box hasn't been checked
            DEFECT-002 Signup fields are cleared if user clicks on language toggle button.
            DEFECT-003 Login / Log in verbage on signup page differs in both EN and FR.
            DEFECT-004 No minimum length for phone number.
            DEFECT-005 Digits shouldn't be allowed in firstname lastname text fields.
            DEFECT-006 British Colombia shouldn't have a - in EN in the province pull down.

Configuration & assumptions
- Target URL comes from `uiData.json` (`urls.signup`). Point this to your QA host.
- Locales: run with `--env locale=en|fr` (default en).  
- Optional: `--env skipInit=true` to skip the auto visit/cookie-accept in `beforeEach`.
- One app exception (`Cannot read properties of null (reading 'document')`) is intentionally suppressed in setup.

In order to run this test package, you'll need to run:
- Install: `npm ci`
- Open runner (default en): `npx cypress open`
- Headless: `npx cypress run`
- Run in French: `npx cypress run --env locale=fr`
- Run in English explicitly: `npx cypress run --env locale=en`
- Run a single spec: `npx cypress run --spec "cypress/e2e/signup_network.cy.js"`

Data prerequisites
- The email in `signup-duplicate.json` must already exist in the target environment to reliably return 409.
