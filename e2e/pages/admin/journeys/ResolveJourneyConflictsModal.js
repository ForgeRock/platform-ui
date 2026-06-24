/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class ResolveJourneyConflictsModal {
  static get dialog() {
    return cy.findByRole('dialog', { name: 'Resolve Journey Conflicts' });
  }

  static get keepExistingSelectAllButton() {
    return ResolveJourneyConflictsModal.dialog
      .contains('div', 'Keep Existing')
      .findByRole('button', { name: 'Select all' });
  }

  static get replaceSelectAllButton() {
    return ResolveJourneyConflictsModal.dialog
      .contains('div', 'Replace')
      .findByRole('button', { name: 'Select all' });
  }

  static keepExistingRadio(treeName) {
    return ResolveJourneyConflictsModal.dialog
      .contains('.row', treeName)
      .findAllByRole('radio')
      .eq(0);
  }

  static replaceRadio(treeName) {
    return ResolveJourneyConflictsModal.dialog
      .contains('.row', treeName)
      .findAllByRole('radio')
      .eq(1);
  }

  static get nextButton() {
    return ResolveJourneyConflictsModal.dialog.findByRole('button', { name: 'Next' });
  }

  static get cancelButton() {
    return ResolveJourneyConflictsModal.dialog.findByRole('button', { name: 'Cancel' });
  }

  static get previousButton() {
    return ResolveJourneyConflictsModal.dialog.findByRole('button', { name: 'Previous' });
  }
}
