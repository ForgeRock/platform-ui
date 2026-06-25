/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class ExportJourneyModal {
  static get dialog() {
    return cy.findByRole('dialog', { name: 'Export Journeys' });
  }

  static get exportButton() {
    return ExportJourneyModal.dialog.findByRole('button', { name: 'Export' });
  }

  static get journeysSection() {
    return ExportJourneyModal.dialog.findByRole('heading', { name: /^Journeys \(\d+\)$/ });
  }

  static get dependenciesHeading() {
    return ExportJourneyModal.dialog.findByRole('heading', { name: 'Dependencies' });
  }

  static get optionalDependenciesHeading() {
    return ExportJourneyModal.dialog.findByRole('heading', { name: 'Optional Dependencies' });
  }

  static dependencyHeading(label) {
    return ExportJourneyModal.dialog.findByRole('heading', { name: new RegExp(`^${label} \\(\\d+\\)$`) });
  }

  static dependencyItem(text) {
    return ExportJourneyModal.dialog.contains('li', text);
  }
}
