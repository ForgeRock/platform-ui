/**
 * Copyright 2025-2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { defineParameterType } from '@badeball/cypress-cucumber-preprocessor';
import {
  ADMIN_PAGES,
  CODE_EDITOR_ICON_SELECTORS,
  JOURNEYS,
  KEYBOARD_ACTIONS,
  ROLES,
} from '../support/constants';

/**
 * Define page parameter type
 * @returns {RegExp} Regular expression that accepts a string with the page label that appears on the sidebar navigation defined on ADMIN_PAGES constants file.
 */
defineParameterType({
  name: 'page',
  regexp: new RegExp(`"(${Object.values(ADMIN_PAGES).map((page) => page.label).join('|')})"`),
  transformer(page) {
    return page;
  },
});

/**
 * Define journey parameter type
 * @returns {RegExp} Regular expression that accepts a string with the journey name defined on JOURNEYS constants file.
 */
defineParameterType({
  name: 'journey',
  regexp: new RegExp(`"(${Object.values(JOURNEYS).map((journey) => journey.name).join('|')})"`),
  transformer(journey) {
    return journey;
  },
});

/**
 * Defines a custom Cucumber parameter type named '{codeEditorIconButton}'.
 * It validates the button name against CODE_EDITOR_ICON_SELECTORS
 * and transforms it into the corresponding CSS selector.
 */
defineParameterType({
  name: 'codeEditorIconButton',
  regexp: new RegExp(Object.keys(CODE_EDITOR_ICON_SELECTORS).join('|')),
  transformer: (key) => CODE_EDITOR_ICON_SELECTORS[key],
});

/**
 * Defines a custom Cucumber parameter type named '{shortcut}'.
 *
 * This allows using human-readable names for keyboard actions in Gherkin steps
 * without quotes (e.g., 'When the user performs the undo keyboard action').
 *
 * It automatically validates that the action exists as a key in KEYBOARD_ACTIONS and
 * transforms the matched name into its corresponding cross-platform command string.
 */
defineParameterType({
  name: 'shortcut',
  regexp: new RegExp(Object.keys(KEYBOARD_ACTIONS).join('|')),
  transformer: (key) => KEYBOARD_ACTIONS[key],
});

/**
 * Defines the {role} parameter type.
 * This parameter type validates the Gherkin role (e.g., "toggle") against the
 * `ROLES` constant map and transforms it into its actual ARIA role (e.g., "switch")
 * before passing it to the step definition.
 */
defineParameterType({
  name: 'role',
  regexp: new RegExp(Object.keys(ROLES).join('|')),
  transformer(gherkinRole) {
    return ROLES[gherkinRole];
  },
});
