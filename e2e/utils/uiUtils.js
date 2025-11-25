/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import hexToRgb from '@e2e/utils/themeutils';

export function clickOnDropdown(index, dropdownName) {
  cy.findAllByLabelText(dropdownName).filter(':visible').eq(index - 1).click({ force: true });
}

export function selectDropdownOption(optionName) {
  cy.findByRole('option', { name: new RegExp(optionName, 'i') }).click();
}

export function typeIntoField(fieldName, text) {
  cy.findByLabelText(fieldName).type(text);
}

/**
 * Reusable helper function to check an element's CSS.
 * @param {string} role - The accessible role of the element (e.g., 'button', 'link').
 * @param {string} name - The accessible name of the element.
 * @param {string} attribute - The CSS attribute to check (e.g., 'color').
 * @param {string} value - The expected value of the attribute.
 */
export function checkElementCss(role, name, attribute, value) {
  let newValue = value;
  if (attribute.includes('color')) {
    newValue = hexToRgb(value);
  }
  cy.findByRole(role, { name }).then(($el) => {
    if (role === 'switch' && attribute.includes('color')) {
      cy.wrap($el)
        .next('label')
        .scrollIntoView()
        .then(($label) => {
          const computedStyle = window.getComputedStyle($label[0], '::before');
          const actualValue = computedStyle.getPropertyValue(attribute);
          expect(actualValue).to.equal(newValue);
        });
    } else {
      (role === 'switch' ? cy.wrap($el).closest('.custom-switch') : cy.wrap($el))
        .scrollIntoView()
        .should('have.css', attribute, newValue);
    }
  });
}

export function selectRadioOption(optionName, clickOptions = {}) {
  cy.findByRole('radio', { name: new RegExp(optionName, 'i') }).click(clickOptions);
}
