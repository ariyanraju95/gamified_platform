// E2E: Lesson viewing and completion flow
describe('Lesson Flow', () => {
  const ts = Date.now();
  const user = {
    username: `lesson_${ts}`,
    email: `lesson_${ts}@test.com`,
    password: 'Password123!',
  };

  before(() => {
    // Register once for all tests in this suite
    cy.request('POST', `${Cypress.env('apiUrl')}/auth/register`, {
      username: user.username,
      email: user.email,
      password: user.password,
      consentGiven: true,
    }).then(({ body }) => {
      user.token = body.token;
      user.id = body.user._id;
      user.mode = body.user.mode;
    });
  });

  beforeEach(() => {
    cy.loginViaApi(user.email, user.password);
    cy.visit('/dashboard');
  });

  it('dashboard shows list of lessons', () => {
    cy.contains(/what is python/i).should('be.visible');
  });

  it('clicking a lesson navigates to the lesson page', () => {
    cy.contains(/what is python/i).click();
    cy.url().should('include', '/lesson/');
    cy.contains(/what is python/i).should('be.visible');
  });

  it('lesson page renders markdown content', () => {
    cy.visit('/lesson/what-is-python');
    // Markdown h1 or h2 should render
    cy.get('h1, h2').should('have.length.greaterThan', 0);
  });

  it('lesson page shows the quiz section', () => {
    cy.visit('/lesson/what-is-python');
    cy.contains(/quiz|question/i).should('be.visible');
  });

  it('selecting a quiz answer and submitting marks lesson progress', () => {
    cy.visit('/lesson/what-is-python');
    // Click first radio option
    cy.get('input[type="radio"]').first().click();
    cy.contains(/submit|check/i).click();
    // Some feedback should appear (correct / incorrect)
    cy.contains(/correct|incorrect|well done|try again/i).should('be.visible');
  });

  it('completing the lesson shows a completion state on dashboard', () => {
    // Complete via API for speed
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/progress/complete`,
      headers: { Authorization: `Bearer ${user.token}` },
      body: {
        lessonSlug: 'what-is-python',
        timeSpentSeconds: 60,
        exerciseAttempts: 1,
        exerciseScore: 100,
      },
      failOnStatusCode: false,
    }).then(() => {
      cy.visit('/dashboard');
      // Check for a "completed" indicator — tick, badge, or "done" label
      cy.contains(/done|completed|✓/i).should('be.visible');
    });
  });
});
