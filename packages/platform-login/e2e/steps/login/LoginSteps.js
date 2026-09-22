/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import LoginPage from '@e2e/pages/login/LoginPage';

export default class LoginSteps {
  static visit() {
    cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
    // The ThemeInjector mounts once a theme is resolved and injects the
    // focus/colour styles this suite asserts on — wait for it, not for a
    // network request (FRAAS default realm uses a static theme and sends none).
    cy.get('#theme-injector style', { timeout: 10000 }).should('exist');
    LoginPage.heading.should('be.visible');
    // The app focuses a container on a deferred timer after load; wait until
    // that has landed so the first Tab press cannot race it.
    cy.focused({ timeout: 10000 }).should('have.class', 'auto-focused');
  }

  static tabToNextElement() {
    // Real key event: the highlight rules are :focus-visible-scoped and
    // programmatic focus does not reliably set it.
    cy.realPress('Tab');
    return cy.focused();
  }

  static assertHasFocusIndicator($el) {
    const elementName = $el.attr('name')
      || $el.attr('aria-label')
      || $el.attr('id')
      || $el[0].tagName.toLowerCase();

    const isInput = $el[0].tagName === 'INPUT';
    const style = window.getComputedStyle($el[0]);

    if (isInput) {
      // Text inputs do not change their border on focus — the visible
      // indicator is the 1px box-shadow ring injected by ThemeInjector.
      expect(style.boxShadow, `${elementName} shows a focus ring`).to.not.equal('none');
    } else {
      expect(style.outlineStyle, `${elementName} shows an outline`).to.eq('solid');
      expect(parseFloat(style.outlineWidth), `${elementName} outline is 2px`).to.eq(2);
    }
  }

  /**
   * Tabs through `LoginPage.focusOrder`, asserting each element is focused in
   * order and shows its focus indicator, and pushes the settled highlight
   * color of each element into `focusColors`.
   *
   * Input rings transition their box-shadow (Bootstrap .form-control), so the
   * value is read on transitionend; the timeout only covers the no-transition
   * case (e.g. reduced motion).
   *
   * @param {Object} focusColors - `{ buttonLinkColors: [], inputColors: [] }` collectors
   */
  static collectFocusHighlights(focusColors) {
    LoginPage.focusOrder.forEach((elementName) => {
      LoginPage[elementName].then(($expected) => {
        LoginSteps.tabToNextElement().then(($focused) => {
          expect($focused[0], `${elementName} is focused in tab order`).to.equal($expected[0]);
          LoginSteps.assertHasFocusIndicator($focused);
          LoginSteps.pushFocusColor($focused, focusColors);
        });
      });
    });
  }

  static pushFocusColor($el, focusColors) {
    return cy.wrap($el).then(($wrapped) => new Cypress.Promise((resolve) => {
      const node = $wrapped[0];
      if (node.tagName !== 'INPUT') {
        focusColors.buttonLinkColors.push(window.getComputedStyle(node).outlineColor);
        resolve();
        return;
      }
      let settled = false;
      const readAndResolve = () => {
        if (settled) return;
        settled = true;
        focusColors.inputColors.push(window.getComputedStyle(node).boxShadow);
        resolve();
      };
      node.addEventListener('transitionend', readAndResolve, { once: true });
      setTimeout(readAndResolve, 500);
    }));
  }

  /**
   * Asserts the collected highlight colors are consistent within each element
   * class, and that the link/button color is the one ThemeInjector declares
   * for `.btn:focus-visible` (its `buttonFocusBorderColor` rule). Inputs are
   * not compared to a theme value: the applied ring is the outcome of a
   * cascade between compiled SCSS variables and ThemeInjector rules, and the
   * presence check in assertHasFocusIndicator covers a dropped rule.
   *
   * @param {Object} focusColors - `{ buttonLinkColors: [], inputColors: [] }` collectors
   */
  static assertSharedFocusColors(focusColors) {
    cy.get('#theme-injector style').then(($styles) => {
      let css = '';
      $styles.each((i, el) => {
        css += el.textContent;
      });
      const buttonRule = LoginSteps.findCssRule(css, '.btn:focus-visible');
      expect(buttonRule, 'ThemeInjector button focus rule found').to.have.length.greaterThan(0);
      const themeButtonColor = LoginSteps.normalizeRgb(buttonRule.match(/outline:\s*2px\s+solid\s+([^;!]+)/)?.[1] || '');

      const { buttonLinkColors, inputColors } = focusColors;
      expect(buttonLinkColors, 'all links and buttons were reached by tabbing').to.have.length.above(0);
      expect(inputColors, 'all inputs were reached by tabbing').to.have.length.above(0);
      expect(new Set(buttonLinkColors).size, 'links and buttons share one highlight color').to.eq(1);
      expect(new Set(inputColors).size, 'inputs share one focus color').to.eq(1);
      buttonLinkColors.forEach((color) => {
        expect(LoginSteps.normalizeRgb(color), 'link/button highlight matches the theme button focus color').to.eq(themeButtonColor);
      });
    });
  }

  /**
   * Finds the first CSS rule in `css` whose selector list contains a selector
   * ending in `selectorPart`.
   *
   * @param {String} css - concatenated stylesheet text
   * @param {String} selectorPart - selector substring to match on
   * @returns {String} the rule body including braces, or ''
   */
  static findCssRule(css, selectorPart) {
    const rulePattern = /([^{}]+)\{([^}]*)\}/g;
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = rulePattern.exec(css)) !== null) {
      const selectors = match[1].split(',').map((s) => s.trim());
      if (selectors.some((s) => s.endsWith(selectorPart))) {
        return match[0];
      }
    }
    return '';
  }

  static normalizeRgb(color) {
    const value = color.trim();
    const hexMatch = value.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (hexMatch) {
      return `${parseInt(hexMatch[1], 16)}, ${parseInt(hexMatch[2], 16)}, ${parseInt(hexMatch[3], 16)}`;
    }
    const match = value.match(/rgba?\(([^)]+)\)/);
    if (!match) return value;
    const [r, g, b] = match[1].split(',').map((part) => parseFloat(part.trim()));
    return `${r}, ${g}, ${b}`;
  }
}
