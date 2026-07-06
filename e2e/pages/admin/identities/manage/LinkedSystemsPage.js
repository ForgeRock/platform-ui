/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../../BaseAdminPage';

/** Page object for the Linked Systems (LinkedApplicationsTab) panel on the identity edit page. */
export default class LinkedSystemsPage extends BaseAdminPage {
  /**
   * A row in the linked applications table matching the given connector name.
   * Clicking it opens the detail dialog for that connector.
   *
   * @param {string} connectorName - Display name of the connector (e.g. 'CsvConnector').
   */
  static connectorRow(connectorName) {
    return cy.findByRole('row', { name: new RegExp(connectorName) });
  }

  /** The connector detail dialog (`id="linkedApplicationModal"`). */
  static get detailDialog() {
    return cy.get('#linkedApplicationModal');
  }

  /** The "Done" button that closes the connector detail dialog. */
  static get doneButton() {
    return cy.findByRole('button', { name: 'Done' });
  }

  /**
   * A string/number/boolean field inside the connector detail dialog, identified by its heading label
   * and expected value rendered as a `<p>` element.
   *
   * @param {string} fieldName - The `<h6>` label text for the field (e.g. 'username').
   * @param {string} value - The expected string value displayed in the `<p>` below the heading.
   */
  static stringFieldValue(fieldName, value) {
    return cy.contains('h6', fieldName).next('p').contains(value);
  }

  /**
   * A JSON/object field inside the connector detail dialog, identified by its heading label.
   * These fields are rendered as a VuePrismEditor (code block).
   *
   * @param {string} fieldName - The `<h6>` label text for the field (e.g. 'Address').
   */
  static jsonField(fieldName) {
    return cy.contains('h6', fieldName).next('div');
  }

  /**
   * A list field (array of primitives) inside the connector detail dialog, identified by its heading label.
   * These fields are rendered as a `<ul>` element.
   *
   * @param {string} fieldName - The `<h6>` label text for the field.
   */
  static listField(fieldName) {
    return cy.contains('h6', fieldName).next('ul');
  }
}
