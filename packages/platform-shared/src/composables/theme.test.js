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
  ThemeApi.getThemes = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [] } }));
  ThemeApi.getThemerealm = jest.fn().mockReturnValue(Promise.resolve({ data: { realm: { testRealm: [{ _id: 'testTheme', primaryColor: '#dddddd' }] } } }));
  function setupTestStore(theme = null, realmThemes = {}) {
    setupTestPinia({ theme, realmThemes });
  }

  describe('retrieving themes - getTheme', () => {
    it('Should retrieve a theme', async () => {
      ThemeApi.getThemes.mockReturnValue(Promise.resolve({ data: { result: [{ _id: 'testTheme', primaryColor: '#dddddd' }] } }));
      setupTestStore();
      const { theme, loadTheme } = useTheme();
      await loadTheme('testRealm', 'testTheme');
      expect(theme.value._id).toBe('testTheme');
    });

    it('should convert original theme config to current config', async () => {
      ThemeApi.getThemes.mockReturnValue(Promise.resolve({ data: [] }));
      ThemeApi.getThemerealm.mockReturnValue(Promise.resolve({ data: { realm: { alpha: { backgroundColor: '#324054' }, testRealm: [{ _id: 'ui/theme-testTheme', primaryColor: '#dddddd' }] } } }));
      setupTestStore();
      const { getRealmThemes, realmThemes } = useTheme();
      await getRealmThemes('alpha');
      expect(realmThemes.value[0].accountCardBackgroundColor).toBe('#ffffff');
      expect(realmThemes.value[0].accountCardShadow).toBe(3);
      expect(realmThemes.value[0].favicon).toBe('https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg');
    });

    it('should convert missing theme config to current config', async () => {
      ThemeApi.getThemes.mockReturnValue(Promise.resolve({ data: [] }));
      ThemeApi.getThemerealm.mockReturnValue(Promise.resolve({ data: { realm: { alpha: undefined, testRealm: [{ _id: 'ui/theme-testTheme', primaryColor: '#dddddd' }] } } }));
      setupTestStore();
      const { getRealmThemes, realmThemes } = useTheme();
      await getRealmThemes('alpha');
      expect(realmThemes.value[0].accountCardBackgroundColor).toBe('#ffffff');
      expect(realmThemes.value[0].accountCardShadow).toBe(3);
      expect(realmThemes.value[0].favicon).toBe('https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg');
    });

    it('Should return the default theme when the requested theme is not found', async () => {
      const realmThemes = [{ _id: 'defaultTheme', isDefault: true, primaryColor: '#aaaaaa' }, { _id: 'otherTheme', primaryColor: '#bbbbbb' }];
      ThemeApi.getThemes.mockReturnValue(Promise.resolve({ data: { result: realmThemes } }));
      setupTestStore('testRealm', realmThemes);
      const { theme, loadTheme } = useTheme();
      await loadTheme('testRealm', 'nonExistentTheme');
      await flushPromises();
      expect(theme.value._id).toBe('defaultTheme');
    });
  });

  describe('saveTheme', () => {
    it('should save theme', async () => {
      const saveSpy = jest.spyOn(ThemeApi, 'saveThemes').mockReturnValue(Promise.resolve({ data: { realm: { testRealm: [{ _id: 'testTheme' }] } } }));
      setupTestStore();
      const { loadTheme, saveTheme } = useTheme();
      await loadTheme('testRealm', 'testTheme');
      await saveTheme('testRealm', { _id: 'testTheme' });
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
    const testThemeId = 'testTheme';
    const otherTheme = { _id: 'otherTheme' };

    const themeStore = useThemeStore();

    // Initial state with two themes
    themeStore.realmThemes = {
      [testRealm]: [
        { _id: testThemeId },
        otherTheme,
      ],
    };

    // Mock return value of saveThemes
    ThemeApi.saveThemes = jest.fn().mockResolvedValue({
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
      realm: expect.objectContaining({
        [testRealm]: [],
      }),
    }));
    expect(themeStore.realmThemes).toEqual([otherTheme]);
    expect(mockRemoveItem).toHaveBeenCalledWith('theme-id');
  });
});
