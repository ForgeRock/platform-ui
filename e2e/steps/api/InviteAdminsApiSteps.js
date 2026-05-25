/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import deleteTeamMemberByEmail from '@e2e/api/inviteAdminsApi.e2e';

export default class InviteAdminsApiSteps {
  static invitedEmails = [];

  static trackInvitedEmail(email) {
    InviteAdminsApiSteps.invitedEmails.push(email);
  }

  static deleteInvitedAdmins() {
    return cy.wrap(null).then(() => {
      if (!InviteAdminsApiSteps.invitedEmails.length) return cy.wrap(null);
      const emails = [...InviteAdminsApiSteps.invitedEmails];
      InviteAdminsApiSteps.invitedEmails = [];
      return cy.wrap(emails).each((email) => deleteTeamMemberByEmail(email));
    });
  }
}
