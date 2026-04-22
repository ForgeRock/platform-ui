/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class CustomDomainModal {
  static get modal() {
    return cy.findByRole('dialog');
  }

  static get domainInput() {
    return CustomDomainModal.modal.findByRole('textbox', { name: /domain/i });
  }

  static get nextButton() {
    return CustomDomainModal.modal.findByRole('button', { name: /next/i });
  }

  static get previousButton() {
    return CustomDomainModal.modal.findByRole('button', { name: /previous/i });
  }

  static get cancelButton() {
    return CustomDomainModal.modal.findByRole('button', { name: /cancel/i });
  }

  static get verifyButton() {
    return CustomDomainModal.modal.findByRole('button', { name: /verify/i });
  }

  static get doneButton() {
    return CustomDomainModal.modal.findByRole('button', { name: /done/i });
  }

  static get closeButton() {
    return CustomDomainModal.modal.findByRole('button', { name: /close/i });
  }

  static get errorAlert() {
    return CustomDomainModal.modal.contains('[role="alert"]', 'Could not verify the specified custom domain');
  }

  static get successHeading() {
    return CustomDomainModal.modal.findByRole('heading', { name: /domain successfully verified!/i });
  }

  static get hostInfo() {
    return CustomDomainModal.modal.findByRole('textbox', { name: /host/i });
  }

  static get dataInfo() {
    return CustomDomainModal.modal.findByRole('textbox', { name: /data/i });
  }
}
