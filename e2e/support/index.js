/**
 * Copyright 2024-2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands';
import './e2e';
import '@percy/cypress';
import { configure } from '@testing-library/cypress';

// Config testing-library so it doesn't output pages of error message listing element suggestions.
configure({
  // eslint-disable-next-line no-unused-vars
  getElementError: (message, _container) => {
    const accessibleRolesStart = 'Here are the accessible roles';
    const messageIncludeSuggestions = message.includes(accessibleRolesStart);
    const firstLineOfMessage = message.split('\n')[0];

    const outputMessage = messageIncludeSuggestions ? firstLineOfMessage : message;

    const error = new Error(outputMessage);
    error.name = 'TestingLibraryElementError';
    return error;
  },
});

// This configuration is designed to handle uncaught exceptions in the application code,
// and prevent these exceptions from stopping the test execution.
Cypress.on('uncaught:exception', (err, runnable) => { // eslint-disable-line no-unused-vars, arrow-body-style
  return false;
});
