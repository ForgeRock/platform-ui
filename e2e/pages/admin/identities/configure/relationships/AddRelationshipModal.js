/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/** Page object for the "Create Relationship" modal opened from the Relationships tab. */
export default class AddRelationshipModal {
  /** The modal dialog, named after its heading. */
  static get modal() {
    return cy.findByRole('dialog', { name: 'Create Relationship' });
  }

  /** Modal description paragraph. */
  static get descriptionText() {
    return AddRelationshipModal.modal.findByText('Define a relationship between this and another object type.');
  }

  /**
   * Source cardinality select ("Has one" / "Has many"). The two cardinality selects have no
   * accessible name; the source one is the only combobox inside the downward arrow block.
   */
  static get sourceCardinalitySelect() {
    return AddRelationshipModal.modal
      .find('.arrow-background--down')
      .findByRole('combobox');
  }

  /** Target cardinality select — the only combobox inside the upward arrow block. */
  static get targetCardinalitySelect() {
    return AddRelationshipModal.modal
      .find('.arrow-background--up')
      .findByRole('combobox');
  }

  /** "Object Type" select used to pick the target managed object. */
  static get objectTypeSelect() {
    return AddRelationshipModal.modal.findByRole('combobox', { name: 'Object Type' });
  }

  /** An option in any select of the modal, matched case-insensitively by text. */
  static option(name) {
    return cy.findByRole('option', { name: new RegExp(name, 'i') });
  }

  /** Next button (disabled until an Object Type is chosen). */
  static get nextButton() {
    return AddRelationshipModal.modal.findByRole('button', { name: 'Next' });
  }

  /** Cancel button. */
  static get cancelButton() {
    return AddRelationshipModal.modal.findByRole('button', { name: 'Cancel' });
  }
}
