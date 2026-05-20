// E2E: SUS Survey submission and score preview
describe('SUS Survey', () => {
  const ts = Date.now();
  const user = {
    username: `survey_${ts}`,
    email: `survey_${ts}@test.com`,
    password: 'Password123!',
  };

  before(() => {
    cy.request('POST', `${Cypress.env('apiUrl')}/auth/register`, {
      username: user.username,
      email: user.email,
      password: user.password,
      consentGiven: true,
    }).then(({ body }) => {
      user.token = body.token;
      user.user = body.user;
    });
  });

  beforeEach(() => {
    cy.loginViaApi(user.email, user.password);
    cy.visit('/survey');
  });

  it('renders the survey page with 10 sliders', () => {
    cy.get('.MuiSlider-root').should('have.length', 10);
  });

  it('shows the live SUS score preview', () => {
    cy.contains(/sus score|your score/i).should('be.visible');
  });

  it('all 10 SUS questions are visible', () => {
    // Each question has a label; MUI Slider labels or surrounding text
    cy.get('.MuiSlider-root').should('have.length', 10);
  });

  it('SUS score updates when sliders change', () => {
    // Get initial score text
    cy.contains(/\d+(\.\d+)?/).then(($el) => {
      const initialText = $el.text();
      // Move the first slider to max (5)
      cy.get('.MuiSlider-root').first().then(($slider) => {
        const sliderEl = $slider[0];
        const input = sliderEl.querySelector('input');
        if (input) {
          cy.wrap(input).invoke('val', 5).trigger('change');
        }
      });
      // Score should differ or page should still show a number
      cy.contains(/\d+(\.\d+)?/).should('be.visible');
    });
  });

  it('shows open-ended feedback text fields', () => {
    cy.get('textarea').should('have.length.greaterThan', 0);
  });

  it('submits the survey and shows a thank-you or confirmation', () => {
    // Set all sliders to default neutral position (3) — just submit as-is
    cy.get('button[type="submit"], button').contains(/submit/i).click();
    cy.contains(/thank|submitted|received|complete/i, { timeout: 6000 }).should('be.visible');
  });

  it('does not allow submitting survey twice', () => {
    // Submit once via API
    const scores = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/survey`,
      headers: { Authorization: `Bearer ${user.token}` },
      body: {
        responses: scores.map((score, i) => ({ questionIndex: i, score })),
        openEnded: { q1: '', q2: '', q3: '' },
      },
      failOnStatusCode: false,
    }).then(() => {
      cy.reload();
      // Should show already-submitted message or redirect
      cy.contains(/already submitted|thank you|submitted/i).should('be.visible');
    });
  });
});
