/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import MessageNodeStylingJourneyPage from '@e2e/pages/login/MessageNodeStylingJourneyPage';
import { generateJourneyURL } from '@e2e/utils/journeyUtils';
import { JOURNEYS } from '@e2e/support/constants';

// "© BLITE 2023" footer is only enabled by the "QA - Theme for Styling on Message Node" theme;
// no realm default theme on our tenants renders that text.
const JOURNEY_THEME_FOOTER_TEXT = 'BLITE';
const JOURNEY_THEME_BUTTON_ROUNDED = '0px'; // theme.buttonRounded = "0", default is 5px
// DEFAULT_THEME_PARAMS.primaryColor — applied by the UI to theme records missing the field
const DEFAULT_PRIMARY_COLOR = '#324054';

/**
 * Converts a theme hex color to the rgb() form getComputedStyle reports.
 * @param {String} hex primaryColor as stored on the theme (e.g. "#324054")
 * @returns {String} css color string (e.g. "rgb(50, 64, 84)")
 */
function hexToRgbString(hex) {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || DEFAULT_PRIMARY_COLOR);
  if (!match) return hex;
  const [, red, green, blue] = match;
  return `rgb(${Number.parseInt(red, 16)}, ${Number.parseInt(green, 16)}, ${Number.parseInt(blue, 16)})`;
}

export default class MessageNodeStylingSteps {
  // primaryColor of the realm's default theme, captured on visit; the default
  // theme differs per tenant (e.g. "Starter" #324054 vs "Contrast" #000000),
  // so the color assertion is derived from the tenant instead of hardcoded.
  static defaultPrimaryColor;

  static visit() {
    cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
    cy.request({
      url: '/openidm/ui/theme',
      qs: { realm: Cypress.env('IS_FRAAS') ? 'alpha' : '/', _queryFilter: 'isDefault eq true', _fields: 'primaryColor' },
      headers: { 'x-requested-with': 'XMLHttpRequest' },
    }).then((response) => {
      MessageNodeStylingSteps.defaultPrimaryColor = hexToRgbString(response.body.result[0]?.primaryColor) || hexToRgbString();
    });
    cy.visit(generateJourneyURL(JOURNEYS.STYLING_ON_MESSAGE_NODE.name));
    cy.wait('@getTheme', { timeout: 10000 });
    MessageNodeStylingJourneyPage.callbacksPanel.should('exist');
  }

  /**
   * The custom theme is the only one rendering a journey footer, and it rounds
   * buttons to 0px; the default theme colors primary buttons with its own
   * primaryColor (tenant-specific, captured in visit()).
   */
  static assertDefaultTheme() {
    MessageNodeStylingJourneyPage.appFooter.should('not.exist');
    MessageNodeStylingJourneyPage.primaryButton.should('be.visible')
      .then(($button) => {
        expect($button.css('background-color'), 'primary button default theme color')
          .to.equal(MessageNodeStylingSteps.defaultPrimaryColor);
      });
  }

  static assertJourneyThemeSwitched() {
    MessageNodeStylingJourneyPage.appFooter.scrollIntoView().should('be.visible')
      .and('contain.text', JOURNEY_THEME_FOOTER_TEXT);
    MessageNodeStylingJourneyPage.primaryButton.should('be.visible')
      .and('have.css', 'border-radius', JOURNEY_THEME_BUTTON_ROUNDED);
  }

  static assertJourneyThemePersists() {
    MessageNodeStylingJourneyPage.appFooter.scrollIntoView().should('be.visible')
      .and('contain.text', JOURNEY_THEME_FOOTER_TEXT);
  }

  static typeUserName(value) {
    MessageNodeStylingJourneyPage.userNameInput.should('be.visible').type(value, { force: true });
  }

  static clickNext() {
    MessageNodeStylingJourneyPage.nextButton.click();
  }

  static clickActionButton(name) {
    MessageNodeStylingJourneyPage.actionButton(name).click();
  }

  /**
   * Stacked: the callback's button group keeps the theme's flex-column layout,
   * so each option wrapper starts a new row (positive above negative).
   */
  static assertActionsStacked(positiveAction, negativeAction) {
    MessageNodeStylingJourneyPage.actionButton(positiveAction).scrollIntoView()
      .should('be.visible')
      .then(($button) => {
        const group = $button[0].closest('[role="group"]');
        expect(group, 'action buttons group').to.not.be.undefined; // eslint-disable-line no-unused-expressions
        expect(window.getComputedStyle(group).flexDirection, 'group flex direction').to.equal('column');
        const negativeButton = Cypress.$(group).find(`[data-testid="btn-${negativeAction.toLowerCase()}"]`)[0];
        expect(negativeButton, 'negative action button').to.not.be.undefined; // eslint-disable-line no-unused-expressions
        expect($button[0].getBoundingClientRect().top, 'positive button is above negative button')
          .to.be.lessThan(negativeButton.getBoundingClientRect().top);
      });
  }

  /**
   * The theme positions the Next button's wrapper (journeySignInButtonPosition);
   * stacked = flex-column under the default theme.
   */
  static assertNextStacked() {
    MessageNodeStylingJourneyPage.nextButton.scrollIntoView().should('be.visible')
      .then(($button) => {
        const wrapper = $button[0].parentElement;
        expect(window.getComputedStyle(wrapper).flexDirection, 'button wrapper flex direction').to.equal('column');
      });
  }

  /**
   * Inline + left: the button group renders flex-row with justify-content-start
   * and both action buttons share the same row.
   */
  static assertActionsInlineLeft(positiveAction, negativeAction) {
    MessageNodeStylingJourneyPage.actionButton(positiveAction).scrollIntoView()
      .should('be.visible')
      .then(($button) => {
        const group = $button[0].closest('[role="group"]');
        expect(group, 'action buttons group').to.not.be.undefined; // eslint-disable-line no-unused-expressions
        const groupStyle = window.getComputedStyle(group);
        expect(groupStyle.display, 'group display').to.equal('flex');
        expect(groupStyle.flexDirection, 'group flex direction').to.equal('row');
        expect(groupStyle.justifyContent, 'group justify-content').to.equal('flex-start');
        const negativeButton = Cypress.$(group).find(`[data-testid="btn-${negativeAction.toLowerCase()}"]`)[0];
        expect(negativeButton, 'negative action button').to.not.be.undefined; // eslint-disable-line no-unused-expressions
        expect($button[0].getBoundingClientRect().top, 'positive and negative share a row')
          .to.be.closeTo(negativeButton.getBoundingClientRect().top, 1);
      });
  }

  /**
   * The theme positions the Next button's wrapper (journeySignInButtonPosition);
   * inline + left = justify-content-start under the custom theme.
   */
  static assertNextInlineLeft() {
    MessageNodeStylingJourneyPage.nextButton.scrollIntoView().should('be.visible')
      .then(($button) => {
        const wrapper = $button[0].parentElement;
        const wrapperStyle = window.getComputedStyle(wrapper);
        expect(wrapperStyle.display, 'button wrapper display').to.equal('flex');
        expect(wrapperStyle.flexDirection, 'button wrapper flex direction').to.equal('row');
        expect(wrapperStyle.justifyContent, 'button wrapper justify-content').to.equal('flex-start');
      });
  }

  static assertActionsRenderAsLinks(positiveAction, negativeAction) {
    MessageNodeStylingJourneyPage.actionButton(positiveAction).should('have.class', 'btn-link');
    MessageNodeStylingJourneyPage.actionButton(negativeAction).should('have.class', 'btn-link');
  }

  /**
   * A single action button on the page, rendered as a button or as a link
   * (btn-link) depending on the page's showButtonsAsLinks. Its wrapper carries
   * the theme's justify-content-start, marking it left-positioned.
   */
  static assertOnlyPositiveAction(positiveAction, { asLink = false } = {}) {
    MessageNodeStylingJourneyPage.actionButton(positiveAction).scrollIntoView()
      .should('be.visible')
      .and(asLink ? 'have.class' : 'not.have.class', 'btn-link')
      .then(($button) => {
        const wrapper = $button[0].parentElement;
        const wrapperStyle = window.getComputedStyle(wrapper);
        expect(wrapperStyle.display, 'button wrapper display').to.equal('flex');
        expect(wrapperStyle.justifyContent, 'button wrapper justify-content').to.equal('flex-start');
      });
    MessageNodeStylingJourneyPage.actionButtons().should('have.length', 1);
  }

  static assertOnlyPositiveActionButton(positiveAction) {
    MessageNodeStylingSteps.assertOnlyPositiveAction(positiveAction, { asLink: false });
  }

  static assertOnlyPositiveActionLink(positiveAction) {
    MessageNodeStylingSteps.assertOnlyPositiveAction(positiveAction, { asLink: true });
  }

  static assertLoginFailureVisible() {
    cy.findAllByRole('alert').contains('Login failure', { timeout: 10000 }).should('be.visible');
  }

  static assertFailureAlertLeftPositioned() {
    MessageNodeStylingJourneyPage.failureAlert.scrollIntoView()
      .should('be.visible')
      .and('have.class', 'text-left');
  }
}
