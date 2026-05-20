// E2E: Authentication flows — registration and login
describe('Authentication', () => {
  const ts = Date.now();
  const stdUser = {
    username: `std_${ts}`,
    email: `std_${ts}@test.com`,
    password: 'Password123!',
  };
  const gamUser = {
    username: `gam_${ts}`,
    email: `gam_${ts}@test.com`,
    password: 'Password123!',
  };

  beforeEach(() => {
    cy.logout();
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it('shows the registration form at /register', () => {
    cy.visit('/register');
    cy.contains(/create.*account/i).should('be.visible');
    cy.get('input[name="username"]').should('exist');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
  });

  it('registers a new user and redirects to dashboard', () => {
    cy.visit('/register');
    cy.get('input[name="username"]').type(stdUser.username);
    cy.get('input[name="email"]').type(stdUser.email);
    cy.get('input[name="password"]').type(stdUser.password);
    // Accept consent checkbox
    cy.get('input[type="checkbox"]').check();
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('shows validation error for duplicate email', () => {
    // Register once
    cy.request('POST', `${Cypress.env('apiUrl')}/auth/register`, {
      username: `dup_${ts}`,
      email: stdUser.email,
      password: stdUser.password,
      consentGiven: true,
    }).then(() => {
      cy.visit('/register');
      cy.get('input[name="username"]').type(`dup2_${ts}`);
      cy.get('input[name="email"]').type(stdUser.email);
      cy.get('input[name="password"]').type(stdUser.password);
      cy.get('input[type="checkbox"]').check();
      cy.get('button[type="submit"]').click();
      cy.contains(/already|exists|taken/i).should('be.visible');
    });
  });

  // ── Login ─────────────────────────────────────────────────────────────────

  it('shows the login form at /login', () => {
    cy.visit('/login');
    cy.contains(/sign in|log in/i).should('be.visible');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
  });

  it('logs in with valid credentials and reaches dashboard', () => {
    // Register via API first
    cy.request('POST', `${Cypress.env('apiUrl')}/auth/register`, {
      username: gamUser.username,
      email: gamUser.email,
      password: gamUser.password,
      consentGiven: true,
    }).then(() => {
      cy.visit('/login');
      cy.get('input[name="email"]').type(gamUser.email);
      cy.get('input[name="password"]').type(gamUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });
  });

  it('shows error for invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('nonexistent@test.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.contains(/invalid|incorrect|not found/i).should('be.visible');
  });

  it('redirects unauthenticated users away from dashboard', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  // ── Logout ────────────────────────────────────────────────────────────────

  it('logs out and clears session', () => {
    cy.request('POST', `${Cypress.env('apiUrl')}/auth/register`, {
      username: `logout_${ts}`,
      email: `logout_${ts}@test.com`,
      password: 'Password123!',
      consentGiven: true,
    }).then(({ body }) => {
      window.localStorage.setItem('token', body.token);
      window.localStorage.setItem('user', JSON.stringify(body.user));
      cy.visit('/dashboard');
      cy.contains(/logout|sign out/i).click();
      cy.url().should('include', '/login');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
      });
    });
  });
});
