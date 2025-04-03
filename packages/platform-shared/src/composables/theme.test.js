/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as ThemeApi from '@forgerock/platform-shared/src/api/ThemeApi';
import { flushPromises } from '@vue/test-utils';
import { useThemeStore } from '@forgerock/platform-shared/src/stores/theme';
import { setupTestPinia } from '../utils/testPiniaHelpers';
import useTheme from './theme';

describe('theme composable', () => {
  ThemeApi.getThemes = jest.fn().mockReturnValue(Promise.resolve({ data: { realm: { '/': [] } } }));
  function setupTestStore(theme = null, realmThemes = {}) {
    setupTestPinia({ theme, realmThemes });
  }

  describe('retrieving themes - getTheme', () => {
    it('Should retrieve a theme', async () => {
      ThemeApi.getThemes.mockReturnValue(Promise.resolve({ data: { realm: { testRealm: [{ _id: 'ui/theme-testTheme', primaryColor: '#dddddd' }] } } }));
      setupTestStore();
      const { theme, loadTheme } = useTheme();
      await loadTheme('testRealm', 'ui/theme-testTheme');
      expect(theme.value._id).toBe('ui/theme-testTheme');
    });

    it('Should retrieve a theme from a cached store', async () => {
      const realmThemes = { realm: { testRealm: [{ _id: 'ui/theme-testTheme', primaryColor: '#dddddd' }] } };
      setupTestStore(null, realmThemes);
      const { theme, loadTheme } = useTheme();
      await loadTheme('testRealm', 'ui/theme-testTheme');
      expect(theme.value._id).toBe('ui/theme-testTheme');
    });

    it('Should return the default theme when the requested theme is not found', async () => {
      const realmThemes = {
        realm: {
          testRealm: [
            {
              _id: 'ui/theme-defaultTheme',
              isDefault: true,
              primaryColor: '#aaaaaa',
            },
            { _id: 'ui/theme-otherTheme', primaryColor: '#bbbbbb' },
          ],
        },
      };
      ThemeApi.getThemes.mockReturnValue(Promise.resolve({ data: realmThemes }));
      setupTestStore('testRealm', realmThemes);
      const { theme, loadTheme } = useTheme();
      await loadTheme('testRealm', 'ui/theme-nonExistentTheme');
      expect(theme.value._id).toBe('ui/theme-defaultTheme');
    });
  });

  describe('saveTheme', () => {
    it('should save theme', async () => {
      ThemeApi.getThemes.mockReturnValue(Promise.resolve({ data: { realm: { testRealm: [{ _id: 'ui/theme-testTheme', primaryColor: '#dddddd' }] } } }));
      const saveSpy = jest.spyOn(ThemeApi, 'saveThemes').mockReturnValue(Promise.resolve({ data: { realm: { testRealm: [{ _id: 'ui/theme-testTheme' }] } } }));
      setupTestStore();
      const { loadTheme, saveTheme } = useTheme();
      await loadTheme('testRealm', 'ui/theme-testTheme');
      await saveTheme('testRealm', { _id: 'ui/theme-testTheme' });
      expect(saveSpy).toHaveBeenCalled();
    });
  });
});

describe('deleteTheme', () => {
  const mockRemoveItem = jest.fn();
  const mockGetItem = jest.fn();

  beforeEach(() => {
    setupTestPinia();

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        removeItem: mockRemoveItem,
      },
      writable: true,
    });

    mockRemoveItem.mockReset();
    mockGetItem.mockReset();
  });

  it('should delete a theme, call saveThemes, and remove from localStorage', async () => {
    const testRealm = 'testRealm';
    const testThemeId = 'ui/theme-testTheme';
    const otherTheme = { _id: 'ui/theme-otherTheme' };

    const themeStore = useThemeStore();

    // Initial state with two themes
    themeStore.realmThemes = {
      [testRealm]: [
        { _id: testThemeId },
        otherTheme,
      ],
    };

    // Mock return value of saveThemes
    ThemeApi.saveThemes.mockResolvedValue({
      data: {
        realm: {
          [testRealm]: [otherTheme], // Only one theme should remain
        },
      },
    });

    // Simulate localStorage containing the full theme ID
    mockGetItem.mockReturnValue(testThemeId);

    const { deleteTheme } = useTheme();
    await deleteTheme(testRealm, testThemeId);
    await flushPromises();

    // Assertions
    expect(ThemeApi.saveThemes).toHaveBeenCalledWith(expect.objectContaining({
      _id: 'ui/themerealm',
      realm: {
        [testRealm]: [otherTheme],
      },
    }));
    expect(themeStore.realmThemes[testRealm]).toEqual([otherTheme]);
    expect(mockRemoveItem).toHaveBeenCalledWith('theme-id');
  });
});
