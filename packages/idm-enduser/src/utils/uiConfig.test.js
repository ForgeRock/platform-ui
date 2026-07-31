/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as ConfigAPI from '@forgerock/platform-shared/src/api/ConfigApi';
import { setUiConfig } from './uiConfig';

import i18n from '../i18n';
import store from '../store';

jest.mock('@forgerock/platform-shared/src/api/ConfigApi');
jest.mock('../i18n');
jest.mock('../store');

describe('setUiConfig', () => {
  let mockCommit;
  let mockLocale;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock store.commit
    mockCommit = jest.fn();
    store.commit = mockCommit;

    // Mock i18n.global.locale (provide a basic structure)
    // We need a way to track changes to the locale
    mockLocale = 'en';
    i18n.global = {
      get locale() {
        return mockLocale;
      },
      set locale(value) {
        mockLocale = value;
      },
    };
  });

  it('should fetch config, set i18n locale, and commit data on success when lang is present', async () => {
    const mockResponse = {
      data: {
        configuration: {
          lang: 'es',
          someOtherConfig: 'value1',
        },
        userId: 'user123',
      },
    };
    ConfigAPI.getUiConfigNoSession.mockResolvedValue(mockResponse);

    await setUiConfig();

    expect(i18n.global.locale).toBe('es');
    expect(mockCommit).toHaveBeenCalledTimes(1);
    expect(mockCommit).toHaveBeenCalledWith(
      'SharedStore/setUiConfig',
      mockResponse.data,
    );
  });

  it('should fetch config and commit data, but NOT set locale if lang is missing', async () => {
    const mockResponse = {
      data: {
        configuration: {
          someOtherConfig: 'value2',
        },
      },
    };
    ConfigAPI.getUiConfigNoSession.mockResolvedValue(mockResponse);
    const initialLocale = i18n.global.locale; // 'en'

    await setUiConfig();

    expect(i18n.global.locale).toBe(initialLocale);
    expect(mockCommit).toHaveBeenCalledTimes(1);
    expect(mockCommit).toHaveBeenCalledWith('SharedStore/setUiConfig', mockResponse.data);
  });

  it('should fetch config and commit data, but NOT set locale if configuration object is missing', async () => {
    const mockResponse = {
      data: {
        userId: 'user456',
      },
    };
    ConfigAPI.getUiConfigNoSession.mockResolvedValue(mockResponse);
    const initialLocale = i18n.global.locale; // 'en'

    await setUiConfig();

    expect(i18n.global.locale).toBe(initialLocale);
    expect(mockCommit).toHaveBeenCalledTimes(1);
    expect(mockCommit).toHaveBeenCalledWith('SharedStore/setUiConfig', mockResponse.data);
  });

  it('should NOT commit or change locale if API call fails', async () => {
    const apiError = new Error('API request failed');
    ConfigAPI.getUiConfigNoSession.mockRejectedValue(apiError);
    const initialLocale = i18n.global.locale; // 'en'

    try {
      await setUiConfig();
    } catch {
      // do nothing
    }

    expect(i18n.global.locale).toBe(initialLocale);
    expect(mockCommit).not.toHaveBeenCalled();
  });
});
