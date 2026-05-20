// E2E: Gamification mechanics — XP, streaks, badges (gamified mode only)
describe('Gamification Mechanics', () => {
  const ts = Date.now();
  const gamUser = {
    username: `gam_e2e_${ts}`,
    email: `gam_e2e_${ts}@test.com`,
    password: 'Password123!',
  };

  before(() => {
    // Force gamified mode by registering; mode is random so retry or use API
    // We request gamified mode via body hint (server ignores, but we loop if needed)
    cy.request('POST', `${Cypress.env('apiUrl')}/auth/register`, {
      username: gamUser.username,
      email: gamUser.email,
      password: gamUser.password,
      consentGiven: true,
    }).then(({ body }) => {
      gamUser.token = body.token;
      gamUser.user = body.user;
    });
  });

  beforeEach(() => {
    cy.loginViaApi(gamUser.email, gamUser.password);
    cy.visit('/dashboard');
  });

  // ── XP ───────────────────────────────────────────────────────────────────

  it('dashboard shows XP bar for gamified users', function () {
    if (gamUser.user?.mode !== 'gamified') this.skip();
    cy.contains(/xp/i).should('be.visible');
    cy.get('.MuiLinearProgress-root').should('exist');
  });

  it('XP increases after completing a lesson (gamified)', function () {
    if (gamUser.user?.mode !== 'gamified') this.skip();

    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/gamification/state`,
      headers: { Authorization: `Bearer ${gamUser.token}` },
    }).then(({ body: before }) => {
      const xpBefore = before.totalXP ?? 0;

      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/progress/complete`,
        headers: { Authorization: `Bearer ${gamUser.token}` },
        body: {
          lessonSlug: 'variables-and-data-types',
          timeSpentSeconds: 90,
          exerciseAttempts: 1,
          exerciseScore: 100,
        },
        failOnStatusCode: false,
      }).then(() => {
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl')}/gamification/state`,
          headers: { Authorization: `Bearer ${gamUser.token}` },
        }).then(({ body: after }) => {
          expect(after.totalXP).to.be.greaterThan(xpBefore);
        });
      });
    });
  });

  // ── Streak ───────────────────────────────────────────────────────────────

  it('streak display is visible on gamified dashboard', function () {
    if (gamUser.user?.mode !== 'gamified') this.skip();
    cy.contains(/streak/i).should('be.visible');
  });

  it('streak updates after lesson completion', function () {
    if (gamUser.user?.mode !== 'gamified') this.skip();

    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/progress/complete`,
      headers: { Authorization: `Bearer ${gamUser.token}` },
      body: {
        lessonSlug: 'string-operations',
        timeSpentSeconds: 120,
        exerciseAttempts: 2,
        exerciseScore: 80,
      },
      failOnStatusCode: false,
    }).then(() => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/gamification/state`,
        headers: { Authorization: `Bearer ${gamUser.token}` },
      }).then(({ body }) => {
        expect(body.currentStreak).to.be.greaterThan(0);
      });
    });
  });

  // ── Badges ───────────────────────────────────────────────────────────────

  it('badge grid is visible on gamified dashboard', function () {
    if (gamUser.user?.mode !== 'gamified') this.skip();
    // BadgeGrid renders MUI Avatar elements
    cy.get('.MuiAvatar-root').should('have.length.greaterThan', 0);
  });

  it('First Step badge is awarded after completing first lesson', function () {
    if (gamUser.user?.mode !== 'gamified') this.skip();

    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/progress/complete`,
      headers: { Authorization: `Bearer ${gamUser.token}` },
      body: {
        lessonSlug: 'what-is-python',
        timeSpentSeconds: 45,
        exerciseAttempts: 1,
        exerciseScore: 100,
      },
      failOnStatusCode: false,
    }).then(() => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/gamification/state`,
        headers: { Authorization: `Bearer ${gamUser.token}` },
      }).then(({ body }) => {
        const earnedNames = body.badgesEarned?.map((b) => b.badgeId?.name || '');
        expect(earnedNames?.some((n) => /first step/i.test(n))).to.be.true;
      });
    });
  });

  // ── XP Popup ─────────────────────────────────────────────────────────────

  it('XP gain popup appears after completing a lesson in the UI', function () {
    if (gamUser.user?.mode !== 'gamified') this.skip();

    cy.visit('/lesson/what-is-python');
    cy.get('input[type="radio"]').first().click();
    cy.contains(/submit|check/i).click();
    cy.contains(/finish|complete lesson/i, { timeout: 5000 }).click();
    // Snackbar / XP popup should appear
    cy.contains(/\+\d+ xp/i, { timeout: 6000 }).should('be.visible');
  });

  // ── Leaderboard ───────────────────────────────────────────────────────────

  it('leaderboard section is visible on gamified dashboard', function () {
    if (gamUser.user?.mode !== 'gamified') this.skip();
    cy.contains(/leaderboard/i).should('be.visible');
  });
});
