// Custom Cypress commands for the gamified learning platform

/**
 * Register a new user via the API directly (bypasses UI for speed).
 * Stores token + user in localStorage to simulate a logged-in session.
 */
Cypress.Commands.add('registerAndLogin', (username, email, password, mode = null) => {
  cy.request('POST', `${Cypress.env('apiUrl')}/auth/register`, {
    username,
    email,
    password,
    consentGiven: true,
    ...(mode && { mode }),
  }).then(({ body }) => {
    window.localStorage.setItem('token', body.token);
    window.localStorage.setItem('user', JSON.stringify(body.user));
    window.localStorage.setItem('sessionId', body.sessionId || '');
  });
});

/**
 * Login via the API and store session.
 */
Cypress.Commands.add('loginViaApi', (email, password) => {
  cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, { email, password }).then(
    ({ body }) => {
      window.localStorage.setItem('token', body.token);
      window.localStorage.setItem('user', JSON.stringify(body.user));
      window.localStorage.setItem('sessionId', body.sessionId || '');
    }
  );
});

/**
 * Clear localStorage and visit home to simulate logout.
 */
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
  });
});

/**
 * Assert that an MUI Snackbar / alert with the given text is visible.
 */
Cypress.Commands.add('assertSnackbar', (text) => {
  cy.contains(text, { timeout: 6000 }).should('be.visible');
});
