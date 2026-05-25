/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class InviteAdminsModal {
  static get modal() {
    return cy.findByRole('dialog');
  }

  static get heading() {
    return InviteAdminsModal.modal.findByRole('heading', { level: 2 });
  }

  // ── Email Addresses ───────────────────────────────────────────────────────────

  // Clicking this opens the multiselect and reveals the underlying text input
  static get emailCombobox() {
    return InviteAdminsModal.modal.findByRole('combobox', { name: /email addresses/i });
  }

  // The actual text input inside the multiselect — only visible after clicking the combobox
  static get emailInput() {
    return InviteAdminsModal.modal.find('input[name="emailAddresses"]');
  }

  // The alert shown when an invalid email format is entered
  static get emailValidationAlert() {
    return InviteAdminsModal.modal.findByRole('alert');
  }

  // ── Role Cards ────────────────────────────────────────────────────────────────

  static roleCard(roleName) {
    return InviteAdminsModal.modal.findByRole('heading', { name: roleName, level: 5 }).closest('.card');
  }

  // ── Footer (invite form) ──────────────────────────────────────────────────────

  static get sendInvitationsButton() {
    return InviteAdminsModal.modal.findByRole('button', { name: /send invitations/i });
  }

  // ── Success screen ────────────────────────────────────────────────────────────

  static get successHeading() {
    return InviteAdminsModal.modal.findByRole('heading', { name: /invitations sent/i, level: 2 });
  }

  static get partialSuccessHeading() {
    return InviteAdminsModal.modal.findByRole('heading', { name: /partial success/i, level: 2 });
  }

  static get invitedMembersHeading() {
    return InviteAdminsModal.modal.findByRole('heading', { name: /invited members/i, level: 3 });
  }

  static invitedMemberItem(email) {
    return InviteAdminsModal.modal.findByText(email);
  }

  static get inviteMorePeopleButton() {
    return InviteAdminsModal.modal.findByRole('button', { name: /invite more people/i });
  }

  static get doneButton() {
    return InviteAdminsModal.modal.findByRole('button', { name: 'Done' });
  }

  // ── Error screen ("Oops, That Didn't Work") ───────────────────────────────────

  static get errorHeading() {
    return InviteAdminsModal.modal.findByRole('heading', { name: /oops, that didn't work/i, level: 2 });
  }

  static get notInvitedHeading() {
    return InviteAdminsModal.modal.findByRole('heading', { name: /not invited/i, level: 3 });
  }

  static notInvitedItem(email) {
    return InviteAdminsModal.modal.findByText(email);
  }

  static get tryAgainButton() {
    return InviteAdminsModal.modal.findByRole('button', { name: /try again/i });
  }
}
