/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { ENV_VALUES } from '@e2e/support/constants';
import themeConstants from '@forgerock/platform-shared/src/constants/themeConstants';
import uuid from 'uuid/v4';
import { faker } from '@faker-js/faker';
import { getIDMThemes, putIDMResource } from '../api/journeyApi.e2e';

export default function hexToRgb(hex) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

export function generateThemeStructure(overrides = {}) {
  const baseTheme = { ...themeConstants.DEFAULT_THEME_PARAMS };
  const shortTimestamp = new Date().getTime().toString().slice(-4);
  const themeName = `TestTheme ${faker.word.adjective()} ${faker.animal.type()} ${shortTimestamp}`;
  baseTheme.name = themeName;
  baseTheme.isDefault = false;
  baseTheme._id = uuid();
  baseTheme.logo = 'img/placeholder.95d0bb8e.svg';
  baseTheme.accountCardInputSelectColor = '#e4f4fd';
  baseTheme.accountCardInputFocusBorderColor = '#324054';
  baseTheme.journeyInputFocusBorderColor = '#324054';
  baseTheme.accountFooter = (baseTheme.accountFooter || '').replace(new Date().getFullYear(), '2025');
  baseTheme.journeyFooter = (baseTheme.journeyFooter || '').replace(new Date().getFullYear(), '2025');
  return {
    ...baseTheme,
    ...overrides,
  };
}

const maxRetryCount = 5;

export function updateThemes(themes) {
  return putIDMResource('config/ui', 'themerealm', themes);
}

export function createThemes(themesToAdd, retry = 0) {
  if (retry > maxRetryCount) {
    throw new Error(`Max retries(${maxRetryCount}) for 'createTheme' reached!`);
  }
  const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';
  return getIDMThemes().then((response) => {
    const existingNames = new Set(response.body.realm[realm].map((theme) => theme.name));
    const newThemes = themesToAdd.filter((theme) => !existingNames.has(theme.name));
    if (newThemes.length > 0) {
      const themes = response.body;
      themes.realm[realm].push(...newThemes);
      updateThemes(themes);
    }
    return getIDMThemes().then((checkResponse) => {
      const checkExistingNames = new Set(checkResponse.body.realm[realm].map((theme) => theme.name));
      const checkNewThemes = themesToAdd.filter((theme) => !checkExistingNames.has(theme.name));
      if (checkNewThemes.length > 0) {
        createThemes(themesToAdd, retry + 1);
      }
    });
  });
}

export function setOriginalRealmDefaultTheme(retry = 0) {
  if (retry > maxRetryCount) {
    throw new Error(`Max retries(${maxRetryCount}) for 'deleteTheme' reached!`);
  }
  const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';
  return getIDMThemes().then((response) => {
    const themes = response.body;
    themes.realm[realm].forEach((theme) => {
      theme.isDefault = false;
    });
    const realmDefaultTheme = themes.realm[realm].find((theme) => theme.name === ENV_VALUES.DEFAULT_THEME);
    if (realmDefaultTheme) {
      realmDefaultTheme.isDefault = true;
    }
    updateThemes(themes);
    return getIDMThemes().then((checkResponse) => {
      const realmDefaultThemeisSet = checkResponse.body.realm[realm].some((theme) => theme.name === ENV_VALUES.DEFAULT_THEME && theme.isDefault === true);
      if (!realmDefaultThemeisSet) {
        return setOriginalRealmDefaultTheme(retry + 1);
      }
      return true;
    });
  });
}

export function deleteThemes(themeNames, retry = 0) {
  if (retry > maxRetryCount) {
    throw new Error(`Max retries(${maxRetryCount}) for 'deleteTheme' reached!`);
  }
  const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';
  return getIDMThemes().then((response) => {
    const themes = response.body;
    themes.realm[realm] = themes.realm[realm].filter((theme) => !themeNames.includes(theme.name));
    updateThemes(themes);
    return getIDMThemes().then((checkResponse) => {
      const notDeletedThemes = checkResponse.body.realm[realm].some((theme) => themeNames.includes(theme));
      if (notDeletedThemes) {
        deleteThemes(themeNames, retry + 1);
      }
    });
  });
}
