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

/**
 * Shared Selector Logic:
 * Returns the Cypress chainable for the specific dropdown trigger button.
 * Centralizes the logic for "More Actions" (icon) vs Named Dropdowns (text).
 */
export const getDropdownTrigger = (dropdownName) => {
  if (dropdownName.toLowerCase() === 'more actions') {
    return cy.findByRole('toolbar').contains('button', 'more_horiz');
  }
  return cy.contains('button', new RegExp(dropdownName, 'i'));
};

export function selectDropdownOption(optionName) {
  cy.findByRole('option', { name: new RegExp(optionName, 'i') }).click();
}

function removeTagsRecursively() {
  cy.get('.multiselect__tags-wrap').then(($tagsWrapper) => {
    if ($tagsWrapper.children().length > 0) {
      cy.get('input').type('{backspace}');
      removeTagsRecursively();
    }
  });
}

export function clearDropdown(dropdownName) {
  cy.findByRole('combobox', { name: dropdownName })
    .parent()
    .within(() => {
      cy.get('input').click({ force: true });
      removeTagsRecursively();
    });
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
