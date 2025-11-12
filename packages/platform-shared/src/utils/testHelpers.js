/**
 * Copyright (c) 2022-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createApp } from 'vue';
import { getAxe } from '@forgerock/platform-shared/config/jest-axe-config';

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
 * @param {String} text the text to match against
 * @returns a wrapper containing the found element
 */
export function findByRole(wrapper, role, text) {
  if (!wrapper) {
    throw new Error('Please provide a wrapper');
  }

  if (typeof role !== 'string') {
    throw new Error('Please provide a valid role');
  }

  if (text !== undefined && typeof text !== 'string') {
    throw new Error('Please provide a valid text value');
  }

  if (text === undefined) {
    return wrapper.find(`[role=${role}]`);
  }

  return wrapper.findAll(`[role=${role}]`).filter((item) => item.text().includes(text))[0];
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
 * Creates a new application container element.
 * @returns {HTMLElement} The created application container element.
 */
export function createAppContainer() {
  const app = document.createElement('div');
  app.id = 'app';
  document.body.appendChild(app);
  return app;
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

/**
 * Mocks certain document functions for testing purposes.
 * Specifically, it overrides `document.createRange` to return a Range object
 * with mocked `getBoundingClientRect` and `getClientRects` methods.
 * Useful for testing components or utilities that rely on DOM Range methods.
 */
export function mockScriptDocumentFunctions() {
  document.createRange = () => {
    const range = new Range();
    range.getBoundingClientRect = jest.fn();
    range.getClientRects = jest.fn(() => ({
      item: () => null,
      length: 0,
    }));
    return range;
  };
}

/**
 * Toggles opened or closed the first actions menu found in the given element.
 * @param {HTMLElement} element The element containing the actions menu button(s).
 */
export async function toggleActionsMenu(element, index = 0) {
  const actionsCellButton = element.findAll('button').filter((item) => item.text().includes('more_horiz'))[index];
  expect(actionsCellButton).toBeDefined();
  await actionsCellButton.trigger('click');
}

/**
 * Helper function for testing composable functions that require setup to be called.
 * It will return the result and the app instance for testing provide/unmount functions if needed
 * @param {*} composable the composable function to test
 */
export function withSetup(composable) {
  let result;
  const app = createApp({
    setup() {
      result = composable();
      // suppress missing template warning
      return () => {};
    },
  });
  app.mount(document.createElement('div'));
  return [result, app];
}

/**
 * Runs axe accessibility checks on a Vue wrapper, DOM node, or HTML string.
 *
 * @param {Object|HTMLElement|Node|string} wrapper
 *   - Vue Test Utils wrapper (has .html() / .element)
 *   - HTMLElement / Node
 *   - HTML string
 * @param {Object} options
 * @param {Object} [options.overrideRules] Axe rule overrides passed to getAxe()
 * @param {boolean} [options.useFullDocument=false] If true, run axe against document.body
 * @param {boolean} [options.cleanupTempContainer=true] Remove temp container if created from HTML string
 * @returns {Promise<Object>} axe results
 *
 * Usage examples:
 * it('component does not have accessibility violations', async () => {
 *   const wrapper = mount(MyComponent);
 *   await flushPromises(); // <-- REQUIRED for async components
 *   await runA11yTest(wrapper, { rules: { 'image-alt': { enabled: false } } });
 * });
 * // Other usage examples:
 * await runA11yTest(wrapper);                       // Vue wrapper
 * await runA11yTest(document.getElementById('x'));  // DOM node
 * await runA11yTest('<div role="dialog">Hi</div>'); // HTML string
 * await runA11yTest(wrapper, { useFullDocument: true }); // include externally controlled nodes
 */
export async function runA11yTest(wrapper, {
  overrideRules = {},
  useFullDocument = false,
  cleanupTempContainer = true,
} = {}) {
  const axe = getAxe(overrideRules);
  let target = null;
  let tempContainer = null;

  // Full document mode (includes external controlled regions)
  if (useFullDocument) {
    target = document.body;
  } else if (wrapper && typeof wrapper === 'object' && typeof wrapper.html === 'function') {
    // Vue wrapper
    // Ensure external referenced nodes (e.g., aria-controls) exist before this call if needed.
    target = wrapper.element;
  } else if (wrapper instanceof HTMLElement) {
    // DOM node / HTMLElement
    target = wrapper;
  } else if (typeof wrapper === 'string') {
    // HTML string
    tempContainer = document.createElement('div');
    tempContainer.setAttribute('data-axe-temp-root', 'true');
    tempContainer.innerHTML = wrapper;
    document.body.appendChild(tempContainer);
    target = tempContainer;
  } else {
    throw new Error('runA11yTest: Unsupported wrapper type. Provide a Vue wrapper, DOM node, or HTML string.');
  }

  if (!target) {
    throw new Error('runA11yTest: Unable to resolve target for axe analysis.');
  }

  const results = await axe(target);
  expect(results).toHaveNoViolations();

  if (tempContainer && cleanupTempContainer) {
    tempContainer.remove();
  }

  return results; // in case further checks are needed in the test
}

export default { findByTestId, findByRole, toggleActionsMenu };
