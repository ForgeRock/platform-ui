/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Page object for the full-page relationship wizard route
 * (Identities > Configure > [object] > Relationships > [relationship]).
 *
 * The wizard renders two property cards (source and target). Cards are told apart by their
 * heading — the managed object display name — so every per-side getter takes the object
 * display name (e.g. 'Alpha realm - Role'). When both sides are the same object type the
 * headings are identical; the `index` ordinal then selects source (0) or target (1) — the
 * only distinction the UI offers in create mode.
 */
export default class RelationshipWizardPage {
  /**
   * Card section for one side of the relationship, scoped by its heading.
   *
   * @param {string} objectDisplayName - Display name of the object owning the card.
   * @param {number} index - Ordinal among cards with the same heading. Only needed when
   *   both sides are the same object type (source 0, target 1).
   */
  static propertyCard(objectDisplayName, index = 0) {
    return cy.findAllByRole('heading', { name: objectDisplayName })
      .eq(index)
      .parents('.card');
  }

  /** "Relationship Property" wizard tab (tablist item). */
  static get propertyTab() {
    return cy.findByRole('tab', { name: 'Relationship Property' });
  }

  /** "Derived Properties" wizard tab. */
  static get derivedPropertiesTab() {
    return cy.findByRole('tab', { name: 'Derived Properties' });
  }

  /** "Relationship Settings" wizard tab. */
  static get settingsTab() {
    return cy.findByRole('tab', { name: 'Relationship Settings' });
  }

  /**
   * "Property Name" input on the given side. Only rendered when creating a new
   * relationship; the prefix (e.g. "custom_") is prepended visually.
   *
   * @param {string} objectDisplayName - Display name of the object owning the property.
   * @param {number} index - Ordinal of the matching card when both cards share a name.
   */
  static propertyNameInput(objectDisplayName, index = 0) {
    return RelationshipWizardPage.propertyCard(objectDisplayName, index).findByLabelText('Property Name');
  }

  /**
   * "Label (optional)" input on the given side.
   *
   * @param {string} objectDisplayName - Display name of the object owning the property.
   * @param {number} index - Ordinal of the matching card when both cards share a name.
   */
  static labelInput(objectDisplayName, index = 0) {
    return RelationshipWizardPage.propertyCard(objectDisplayName, index).findByLabelText('Label (optional)');
  }

  /**
   * "Description (optional)" textarea on the given side.
   *
   * @param {string} objectDisplayName - Display name of the object owning the property.
   * @param {number} index - Ordinal of the matching card when both cards share a name.
   */
  static descriptionInput(objectDisplayName, index = 0) {
    return RelationshipWizardPage.propertyCard(objectDisplayName, index).findByLabelText('Description (optional)');
  }

  /**
   * "Display Properties (optional)" multiselect on the given side.
   *
   * @param {string} objectDisplayName - Display name of the object owning the property.
   * @param {number} index - Ordinal of the matching card when both cards share a name.
   */
  static displayPropertiesSelect(objectDisplayName, index = 0) {
    return RelationshipWizardPage.propertyCard(objectDisplayName, index)
      .findByRole('combobox', { name: 'Display Properties (optional)' });
  }

  /**
   * An option in the Display Properties multiselect. Returns the first match — property
   * titles can repeat across a card's option list (e.g. two "Name" entries).
   *
   * @param {string} name - Option title as rendered (property title or key).
   */
  static displayPropertyOption(name) {
    return cy.findAllByRole('option', { name: new RegExp(`^${name}$`, 'i') }).first();
  }

  /**
   * Top-left breadcrumb back link returning to the relationships list
   * (e.g. "Back to Alpha realm - Role").
   */
  static get backButton() {
    return cy.findByRole('link', { name: /Back to/ });
  }

  /** Next button in the footer (create mode; disabled until Property Names are filled). */
  static get nextButton() {
    return cy.findByTestId('nextButton');
  }

  /** Previous button in the footer. */
  static get previousButton() {
    return cy.findByRole('button', { name: 'Previous' });
  }

  /**
   * Save button in the footer — present on the final step in create mode and on every
   * step in edit mode. The edit-mode footer's ButtonWithSpinner carries no testid, so
   * the shared "Save" aria-label is the locator for both modes.
   */
  static get saveButton() {
    return cy.findByRole('button', { name: 'Save' });
  }

  /** Cancel button in the footer. */
  static get cancelButton() {
    return cy.findByRole('button', { name: 'Cancel' });
  }

  /** The "More Actions" trigger in the wizard navbar (edit mode only). */
  static get moreActionsButton() {
    return cy.findByRole('button', { name: 'More Actions' });
  }
}
