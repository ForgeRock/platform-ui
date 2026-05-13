/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../../BaseAdminPage';

/** Page object for the Managed Object Type detail page (Identities > Configure > [object]). */
export default class ManagedObjectTypePage extends BaseAdminPage {
  /** "Details" tab — open by default; contains the Description and Display Label form. */
  static get detailsTab() {
    return cy.findByRole('tab', { name: 'Details' });
  }

  /** "Properties" tab — lists schema properties for the managed object type. */
  static get propertiesTab() {
    return cy.findByRole('tab', { name: 'Properties' });
  }

  /** "Relationships" tab — lists relationship definitions for the managed object type. */
  static get relationshipsTab() {
    return cy.findByRole('tab', { name: 'Relationships' });
  }

  /** "Advanced Sync" tab — configures sync policies for the managed object type. */
  static get advancedSyncTab() {
    return cy.findByRole('tab', { name: 'Advanced Sync' });
  }

  /** Save button that submits the Details form via PUT openidm/config/managed. */
  static get saveButton() {
    return cy.findByRole('button', { name: 'Save' });
  }

  /**
   * The tabpanel rendered when the Details tab is active.
   * Scopes child queries (e.g. descriptionInput, displayLabelInput) to this panel
   * so they don't match duplicate fields if the "lazy" prop is ever removed from BTabs.
   */
  static get detailsTabPanel() {
    return cy.findByRole('tabpanel', { name: 'Details' });
  }

  /** "Description (optional)" text input inside the Details tabpanel. */
  static get descriptionInput() {
    return ManagedObjectTypePage.detailsTabPanel.findByLabelText('Description (optional)');
  }

  /** "Display Label" text input inside the Details tabpanel — sets the human-readable name shown in the UI. */
  static get displayLabelInput() {
    return ManagedObjectTypePage.detailsTabPanel.findByLabelText('Display Label');
  }
}
