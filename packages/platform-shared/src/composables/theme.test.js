/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as ThemeApi from '@forgerock/platform-shared/src/api/ThemeApi';
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
