// Committee Members Section Tests

describe('Committee Members Section', () => {
  beforeEach(() => {
    cy.visit('/about.html');
  });

  it('should display the committee section with proper heading', () => {
    cy.get('.content').eq(1).find('h2').should('contain.text', 'Core Committee 2025');
  });

  it('should display all committee members in a grid layout', () => {
    cy.get('.committee-grid').should('exist');
    cy.get('.member-card').should('have.length', 15);
  });

  it('should display leadership roles with enhanced styling', () => {
    // Check Director
    cy.get('.member-card.director').should('exist');
    cy.get('.member-card.director').find('h3').should('contain.text', 'Prathamesh Wamane');
    cy.get('.member-card.director').find('p').should('contain.text', 'Director');

    // Check President
    cy.get('.member-card.president').should('exist');
    cy.get('.member-card.president').find('h3').should('contain.text', 'Krishna Shimpi');
    cy.get('.member-card.president').find('p').should('contain.text', 'President');

    // Check Vice President
    cy.get('.member-card.vp').should('exist');
    cy.get('.member-card.vp').find('h3').should('contain.text', 'Pratik Thorat');
    cy.get('.member-card.vp').find('p').should('contain.text', 'Vice President');
  });

  it('should display department heads with appropriate styling', () => {
    cy.get('.member-card.head').should('have.length', 9);
  });

  it('should display mentors with distinct styling', () => {
    cy.get('.member-card.mentor').should('have.length', 2);
  });

  it('should have accessible member cards with proper ARIA attributes', () => {
    cy.get('.member-card').each($card => {
      cy.wrap($card).should('have.attr', 'role', 'listitem');
      cy.wrap($card).should('have.attr', 'tabindex', '0');
      cy.wrap($card).should('have.attr', 'aria-label');
    });
  });

  it('should have profile avatars for all members', () => {
    cy.get('.member-avatar').should('have.length', 15);
  });

  it('should have responsive grid layout', () => {
    // Desktop view
    cy.viewport(1200, 800);
    cy.get('.committee-grid').should('have.css', 'grid-template-columns', 'repeat(5, 1fr)');

    // Tablet view
    cy.viewport(768, 1024);
    cy.get('.committee-grid').should('have.css', 'grid-template-columns', 'repeat(3, 1fr)');

    // Mobile view
    cy.viewport(480, 800);
    cy.get('.committee-grid').should('have.css', 'grid-template-columns', '1fr');
  });

  it('should have hover effects on member cards', () => {
    cy.get('.member-card').first().trigger('mouseover');
    cy.get('.member-card').first().should('have.css', 'transform').and('not.eq', 'none');
  });

  it('should maintain visual hierarchy for key roles', () => {
    // Director should be visually distinct
    cy.get('.member-card.director')
      .should('have.css', 'border-top-color')
      .and('not.eq', 'rgba(0, 0, 0, 0)');

    // President should be visually distinct
    cy.get('.member-card.president')
      .should('have.css', 'border-top-color')
      .and('not.eq', 'rgba(0, 0, 0, 0)');

    // VP should be visually distinct
    cy.get('.member-card.vp')
      .should('have.css', 'border-top-color')
      .and('not.eq', 'rgba(0, 0, 0, 0)');
  });
});
