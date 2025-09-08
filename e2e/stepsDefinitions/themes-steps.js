/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import { THEME_UI_FIELD_MAPPING } from '@e2e/support/constants';
import {
  generateThemeStructure,
  createThemes,
  setOriginalRealmDefaultTheme,
  deleteThemes,
} from '@e2e/utils/themeutils';

this.createdThemes = [];

afterEach(() => {
  if (Cypress.spec.relative.includes('hosted-pages')) {
    if (this.createdThemes.length > 0) {
      cy.log(`Deleting created theme(s) ${this.createdThemes} via API`).then(() => {
        setOriginalRealmDefaultTheme();
        deleteThemes(this.createdThemes);
        this.createdThemes = [];
      });
    }
  }
});

Given('theme {string} is created via API', (name) => {
  const theme = generateThemeStructure({ name });
  createThemes([theme]).then(() => this.createdThemes.push(theme.name));
});

Given('themes are created via API', (dataTable) => {
  const themes = dataTable.raw().map(([name]) => generateThemeStructure({ name }));
  createThemes(themes).then(() => {
    this.createdThemes = themes.map((theme) => theme.name);
  });
});

Given('theme {string} is created via API with following options:', (name, dataTable) => {
  const overrides = { name };
  dataTable.hashes().forEach((row) => {
    const jsonKey = THEME_UI_FIELD_MAPPING[row.Field] || row.Field;
    overrides[jsonKey] = row.Value;
  });
  const theme = generateThemeStructure(overrides);
  createThemes([theme]).then(() => {
    this.createdThemes.push(theme.name);
  });
});

Then('the new theme name is {string}', (themeName) => {
  this.createdThemes.push(themeName);
});
