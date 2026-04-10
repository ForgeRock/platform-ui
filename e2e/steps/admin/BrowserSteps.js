/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class BrowserSteps {
  static refreshPage() {
    cy.reload();
  }

  static spyOnConsoleErrors() {
    cy.window().then((win) => {
      cy.spy(win.console, 'error').as('consoleError');
    });
  }

  static assertNoCspErrors() {
    cy.get('@consoleError').should((spy) => {
      const cspErrors = spy.getCalls()
        .map((call) => call.args[0])
        .filter((msg) => typeof msg === 'string' && (msg.includes('Content Security Policy') || msg.includes('CSP')));
      expect(cspErrors).to.have.length(0);
    });
  }
}
