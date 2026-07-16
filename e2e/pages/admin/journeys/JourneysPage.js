/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class JourneysPage {
  static get heading() {
    return cy.findByRole('heading', { name: 'Journeys', timeout: 10000 });
  }

  static get addJourneyButton() {
    return cy.findByRole('button', { name: 'Add Journey', timeout: 5000 });
  }

  static get searchBox() {
    return cy.findByRole('searchbox', { name: 'Search' });
  }

  static categoryTab(categoryName) {
    return cy.findByTestId(`category-tab-${categoryName}`);
  }

  static categoryTabCount(categoryName) {
    return JourneysPage.categoryTab(categoryName).children().last();
  }

  static journeyRowButton(treeTitle) {
    // Match the title span directly to avoid @testing-library's accessible-name computation
    // crashing on journeys that carry a "Default" badge (appends badge text to the name).
    return cy.get('.tab-content')
      .should('be.visible')
      .find('[data-testid="tree-header-title"] span.text-truncate')
      .contains(new RegExp(`^${treeTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`))
      .closest('[role="button"]');
  }

  static get defaultJourneyBadge() {
    return cy.get('.tab-content').findByText('Default');
  }
}
