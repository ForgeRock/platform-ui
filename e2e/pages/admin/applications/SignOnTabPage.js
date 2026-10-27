/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * POM for the Sign On tab of a SAML application's edit view. Covers the initial
 * "Set Up SSO" state, the Set Up SSO modal (instructions / upload steps), and
 * the post-setup Quick Start and Endpoints cards.
 */
export default class SignOnTabPage {
  // ── Initial setup state (no IdP + SP yet) ────────────────────────────────────

  static get setUpSsoButton() {
    return cy.findByRole('button', { name: /set up sso/i }, { timeout: 15000 });
  }

  // ── Set Up SSO modal (#setupSsoModal) ────────────────────────────────────────

  static get setupSsoModal() {
    return cy.get('#setupSsoModal', { timeout: 15000 });
  }

  static get setupSsoModalVisible() {
    return SignOnTabPage.setupSsoModal.should('be.visible');
  }

  // BFormFile renders a visually hidden input plus a visible "Browse" button —
  // the label "Metadata file" comes from the component's placeholder text
  static get metadataFileInput() {
    return SignOnTabPage.setupSsoModal.findByLabelText('Metadata file');
  }

  static get modalNextButton() {
    return SignOnTabPage.setupSsoModal.findByRole('button', { name: /^next$/i });
  }

  static get downloadMetadataButton() {
    return SignOnTabPage.setupSsoModal.findByRole('button', { name: /download metadata/i });
  }

  // ── Post-setup cards ─────────────────────────────────────────────────────────

  static get quickStartCard() {
    return cy.get('#samlSignOnQuickStart', { timeout: 15000 }).should('be.visible');
  }

  static get viewIdpMetadataButton() {
    return SignOnTabPage.quickStartCard.findByRole('button', { name: /view idp metadata/i });
  }

  static get idpLoginEndpointField() {
    return cy.findByLabelText('IDP-Initiated Login Endpoint');
  }

  // ── Settings card footer ─────────────────────────────────────────────────────

  static get tryItOutButton() {
    return cy.findByRole('button', { name: /try it out/i });
  }
}
