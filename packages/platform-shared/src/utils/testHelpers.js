/**
 * Copyright (c) 2022-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * vue-test-utils helper function for getting an element by data-testid
 * @param {*} wrapper the component wrapper
 * @param {*} testId the data-testid string
 * @returns a wrapper containing the found element
 */
export function findByTestId(wrapper, testId) {
  if (!wrapper) {
    throw new Error('Please provide a wrapper');
  }

  if (typeof testId !== 'string') {
    throw new Error('Please provide a valid data-testid');
  }

  return wrapper.find(`[data-testid="${testId}"]`);
}

export function findByName(wrapper, name) {
  if (!wrapper) {
    throw new Error('Please provide a wrapper');
  }

  if (typeof name !== 'string') {
    throw new Error('Please provide a valid name');
  }

  return wrapper.find(`[name="${name}"]`);
}

export function findComponentByTestId(wrapper, testId) {
  if (!wrapper) {
    throw new Error('Please provide a wrapper');
  }

  if (typeof testId !== 'string') {
    throw new Error('Please provide a valid data-testid');
  }

  return wrapper.findComponent(`[data-testid=${testId}]`);
}

/**
 * vue-test-utils helper function for getting all elements matching data-testid
 * @param {*} wrapper the component wrapper
 * @param {*} testId the data-testid string
 * @returns a wrapperArray containing the found elements
 */
export function findAllByTestId(wrapper, testId) {
  if (!wrapper) {
    throw new Error('Please provide a wrapper');
  }

  if (typeof testId !== 'string') {
    throw new Error('Please provide a valid data-testid');
  }

  return wrapper.findAll(`[data-testid="${testId}"]`);
}

/**
 * vue-test-utils helper function for getting an element by role
 * @param {*} wrapper the component wrapper
 * @param {*} role the role
 * @returns a wrapper containing the found element
 */
export function findByRole(wrapper, role) {
  if (!wrapper) {
    throw new Error('Please provide a wrapper');
  }

  if (typeof role !== 'string') {
    throw new Error('Please provide a valid role');
  }

  return wrapper.find(`[role=${role}]`);
}

/**
 * vue-test-utils helper function for getting all elements matching the passed text
 * @param {*} wrapper the component wrapper
 * @param {*} selector an selector (eg. element tag) to filter matches by
 * @param {String} text the text to match against
 * @returns a wrapper array containing the found elements
 */
export function findAllByText(wrapper, selector, text) {
  if (!wrapper) throw new Error('Please provide a wrapper');
  if (selector === null || selector === undefined) throw new Error('Please provide a valid selector');
  if (typeof text !== 'string') throw new Error('Please provide a valid text value');

  return wrapper.findAll(selector).filter((item) => item.text().includes(text));
}

/**
 * vue-test-utils helper function for getting an element by text
 * @param {*} wrapper the component wrapper
 * @param {*} selector an selector (eg. element tag) to filter matches by
 * @param {String} text the text to match against
 * @returns a wrapper containing the found element
 */
export function findByText(wrapper, selector, text) {
  return findAllByText(wrapper, selector, text)[0];
}

/**
 * vue-test-utils helper function for creating containers with provided IDs
 * @param {*} idArray the array of ids that need to be created for the tooltip component to find
 */
export function createTooltipContainer(idArray = []) {
  idArray.forEach((elementId) => {
    const tooltipElement = document.createElement('span');
    tooltipElement.setAttribute('id', elementId);
    document.body.appendChild(tooltipElement);
  });
}

export default { findByTestId, findByRole };
