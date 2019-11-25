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
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("login", (username, password) => {
  // if (sessionStorage.access_token) return;

  // const body = {
  //     grant_type: "password",
  //     client_id: Cypress.env("REACT_APP_OAUTH_CLIENT_ID"),
  //     client_secret: Cypress.env("REACT_APP_OAUTH_CLIENT_SECRET"),
  //     username: username,
  //     password: password,
  //     scope: "*"
  // };

  // return axios.post("/oauth/token", body).then(response => {
  //     const token = response.data.access_token;
  //     axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  //     sessionStorage.access_token = token;
  // });
});

// https://stackoverflow.com/questions/50750956/how-to-select-nth-item-inside-select-element-in-cypress
Cypress.Commands.add(
  'selectNth',
  { prevSubject: 'element' },
  (subject, pos, children) => {
    cy.wrap(subject)
      .children(children)
      .eq(pos)
      .then(e => {
        cy.wrap(subject).select(e.val())
      })
  }
)