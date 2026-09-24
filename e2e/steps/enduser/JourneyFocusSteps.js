/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import JourneyFocusPage from '../../pages/login/JourneyFocusPage';

const AUTO_FOCUSED = 'auto-focused';

/**
 * Steps for walking a journey's pages and asserting the Focus First state on
 * the login app (enduser POV). Focus is applied ~200ms after the step renders
 * (handleFocus in platform-login/src/views/Login/index.vue), so every
 * assertion chains on cy.focused() — its retry covers the deferral without
 * fixed waits. The focused element always carries the auto-focused class and
 * is distinguished by whether it wraps the theme header (#appHeader): the
 * header container, the card/main container, or the page container (themes
 * without a header — also no #appHeader, only distinguishable by which TAB
 * target follows).
 */
export default class JourneyFocusSteps {
  static visitJourney(journeyName) {
    JourneyFocusPage.visit(journeyName);
  }

  /**
   * Advances to the next journey page and waits for its heading, so the
   * following focus assertions never run against the previous page.
   * @param {String} expectedHeader heading text of the page being entered
   */
  static next(expectedHeader) {
    JourneyFocusPage.nextButton().should('be.visible').click();
    cy.get('h1').should(($h1) => {
      expect($h1.toArray().map((el) => el.textContent.trim())).to.include(expectedHeader);
    });
  }

  static pressTab() {
    JourneyFocusPage.pressTab();
  }

  /**
   * Asserts the focused element is the auto-focused container wrapping the
   * theme header. Used on pages whose theme has a header.
   */
  static assertHeaderFocused() {
    JourneyFocusPage.focusedElement().should(($el) => {
      expect($el.hasClass(AUTO_FOCUSED), 'focused element has auto-focused class').to.equal(true);
      expect($el.find('#appHeader').length, 'focused element wraps #appHeader').to.be.at.least(1);
    });
  }

  /**
   * Asserts the focused element is the auto-focused card/main container on a
   * page whose theme has a header (so "no header inside" proves card).
   */
  static assertCardFocused() {
    JourneyFocusPage.focusedElement().should(($el) => {
      expect($el.hasClass(AUTO_FOCUSED), 'focused element has auto-focused class').to.equal(true);
      expect($el.find('#appHeader').length, 'focused element has no header inside').to.equal(0);
    });
  }

  /**
   * Asserts the focused element is the auto-focused page container. Used on
   * pages whose theme disables the header: card and container are then the
   * same element and indistinguishable from each other by DOM check.
   */
  static assertPageContainerFocused() {
    JourneyFocusPage.focusedElement().should(($el) => {
      expect($el.hasClass(AUTO_FOCUSED), 'focused element has auto-focused class').to.equal(true);
      expect($el.find('#appHeader').length, 'focused element has no header inside').to.equal(0);
      expect(document.getElementById('appHeader'), '#appHeader absent from page').to.equal(null);
    });
  }

  /**
   * Asserts the focused element is the header's skip-to-main-content button.
   */
  static assertSkipLinkFocused() {
    JourneyFocusPage.focusedElement().should(($el) => {
      expect($el.prop('tagName'), 'focused element is a button').to.equal('BUTTON');
      expect($el.text().trim(), 'focused element is the skip link').to.equal('Skip to main content');
    });
  }

  /**
   * Asserts the focused element is a hyperlink inside the theme header.
   */
  static assertHeaderLinkFocused() {
    JourneyFocusPage.focusedElement().should(($el) => {
      expect($el.prop('tagName'), 'focused element is a link').to.equal('A');
      expect($el.closest('#appHeader').length, 'focused element inside header').to.equal(1);
    });
  }

  /**
   * Asserts the focused element is a form input whose label starts with the
   * given text (required fields render a hidden asterisk span after it).
   * @param {String} labelText expected label text (e.g. 'User Name')
   */
  static assertInputFocused(labelText) {
    JourneyFocusPage.focusedElement().should(($el) => {
      expect($el.prop('tagName'), 'focused element is an input').to.equal('INPUT');
      const label = $el.closest('.w-100').find(`label[for="${$el.attr('id')}"]`);
      expect(label.text().trim(), `focused input labelled ${labelText}`).to.contain(labelText);
    });
  }

  /**
   * Asserts the focused element is the link with the given text inside the
   * card description (e.g. 'Create an account').
   * @param {String} linkText expected link text
   */
  static assertCardLinkFocused(linkText) {
    JourneyFocusPage.focusedElement().should(($el) => {
      expect($el.prop('tagName'), 'focused element is a link').to.equal('A');
      expect($el.text().trim(), `focused link reads ${linkText}`).to.equal(linkText);
    });
  }
}
