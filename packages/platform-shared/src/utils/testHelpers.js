/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
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

  return wrapper.find(`[data-testid=${testId}]`);
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

  return wrapper.findAll(`[data-testid=${testId}]`);
}

/**
 * vue-test-utils helper function for getting an element by role
 * @param {*} wrapper the component wrapper
 * @param {*} testId the role
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

export default { findByTestId, findByRole };
