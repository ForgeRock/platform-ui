/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../../../BaseAdminPage';

/** Page object for the Relationships tab of a managed object type (Identities > Configure > [object] > Relationships). */
export default class RelationshipsListPage extends BaseAdminPage {
  /**
   * "Relationship" add button — visible both in the empty state and above the table.
   * Its accessible name is "Relationship" (i18n relationships.label), not "New relationship".
   */
  static get newRelationshipButton() {
    return cy.findByRole('button', { name: 'Relationship' });
  }

  /** "Relationship" column header of the relationships table. */
  static get table() {
    return cy.findByRole('table');
  }

  /** Empty state heading shown when the object type has no relationships. */
  static get emptyState() {
    return cy.findByRole('heading', { name: 'No relationships yet' });
  }

  /** Empty state description below the heading. */
  static get emptyStateSubText() {
    return cy.findByText('Create relationships between this and other object types.');
  }

  /**
   * A row in the relationships table, identified by its cell text. Rows read
   * "{source label or property name} {source object} {relationship type icon} {target label or property name} {target object}".
   *
   * Uses `contains` rather than findByRole('row', { name }) — the role query intermittently
   * throws "Cannot read properties of null (reading 'includes')" while retrying on ForgeOps.
   *
   * @param {string} name - Source property name or label of the relationship row.
   */
  static row(name) {
    return cy.get('table').contains('tr', name);
  }

  /** The "More Actions" trigger inside a relationship row (shared ActionsCell). */
  static rowActions(name) {
    return RelationshipsListPage.row(name).findByRole('button', { name: 'More Actions' });
  }

  /** The delete confirmation dialog (shared DeleteModal): "Delete Relationship?". */
  static get deleteModal() {
    return cy.findByRole('dialog', { name: 'Delete Relationship?' });
  }

  /** Cancel button inside the delete modal. */
  static get deleteModalCancelButton() {
    return RelationshipsListPage.deleteModal.findByRole('button', { name: 'Cancel' });
  }

  /** Delete confirmation button inside the delete modal. */
  static get deleteModalConfirmButton() {
    return RelationshipsListPage.deleteModal.findByRole('button', { name: 'Delete' });
  }
}
