export function clickOnDropdown(index, dropdownName) {
  cy.findAllByLabelText(dropdownName).filter(':visible').eq(index - 1).click({ force: true });
}

export function selectDropdownOption(optionName) {
  cy.findByRole('option', { name: optionName }).click();
}

export function typeIntoField(fieldName, text) {
  cy.findByLabelText(fieldName).type(text);
}
