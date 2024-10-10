describe('Basic E2E Test', () => {
  it('visits the homepage', () => {
    cy.visit('/');
    cy.contains('OnlyJapan').should('be.visible');
  });

  it('navigates to the explore page', () => {
    cy.visit('/');
    cy.contains('explore').click();
    cy.url().should('include', '/explore');
    cy.contains('exploreCreators').should('be.visible');
  });

  it('attempts to access a protected route', () => {
    cy.visit('/profile');
    // Assuming the app redirects to login for protected routes
    cy.url().should('include', '/auth/login');
  });

  it('displays login form', () => {
    cy.visit('/auth/login');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.contains('button', 'login').should('be.visible');
  });

  it('displays signup form', () => {
    cy.visit('/auth/signup');
    cy.get('input[name="name"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.contains('button', 'signup').should('be.visible');
  });
});