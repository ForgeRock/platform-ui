/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as ThemeApi from '@forgerock/platform-shared/src/api/ThemeApi';
import { flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '../utils/testPiniaHelpers';
import useTheme from './theme';

describe('theme composable', () => {
  ThemeApi.getThemeMetadata = jest.fn().mockReturnValue(Promise.resolve({ data: { defaultRealmThemeId: { testRealm: 'ui/theme-testTheme' } } }));
  ThemeApi.getRealmTheme = jest.fn().mockReturnValue(Promise.resolve({ data: { _id: 'ui/theme-testTheme' } }));
  ThemeApi.getRealmThemes = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [{ _id: 'ui/theme-defaultThemeId' }, { _id: 'ui/theme-treeThemeId' }] } }));
  ThemeApi.getRealmThemeByName = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [{ _id: 'ui/theme-defaultThemeId' }] } }));
  ThemeApi.getLegacyThemes = jest.fn().mockReturnValue(Promise.resolve({ data: { realm: { '/': [] } } }));
  function setupTestStore(theme = null, realmThemes = {}) {
    setupTestPinia({ theme, realmThemes });
  }

  describe('retrieving themes - getTheme', () => {
    it('should determine if the current tenant has current or legacy themes', async () => {
      setupTestStore();
      ThemeApi.getRealmTheme.mockReturnValue(Promise.resolve({ data: null }));
      const { isLegacyTheme, getTheme } = useTheme();
      expect(isLegacyTheme.value).toBe(false);
      await getTheme('testRealm', 'ui/theme-test');
      expect(isLegacyTheme.value).toBe(true);
    });

    it('should retrieve a single config file theme', async () => {
      ThemeApi.getRealmTheme.mockReturnValue(Promise.resolve({ data: { _id: 'ui/theme-testTheme', primaryColor: '#eeeeee' } }));
      setupTestStore();
      const { theme, loadTheme } = useTheme();
      await loadTheme('testRealm', 'ui/theme-testTheme');
      await flushPromises();
      expect(theme.value._id).toBe('ui/theme-testTheme');
      expect(theme.value.primaryColor).toBe('#eeeeee');
    });

    it('Should retrieve a legacy theme', async () => {
      ThemeApi.getRealmTheme.mockReturnValue(Promise.resolve({ data: null }));
      ThemeApi.getLegacyThemes.mockReturnValue(Promise.resolve({ data: { realm: { testRealm: [{ _id: 'ui/theme-testTheme', primaryColor: '#dddddd' }] } } }));
      setupTestStore();
      const { theme, loadTheme } = useTheme();
      await loadTheme('testRealm', 'ui/theme-testTheme');
      expect(theme.value._id).toBe('ui/theme-testTheme');
    });

    it('Should retrieve a legacy theme from a cached store', async () => {
      ThemeApi.getRealmTheme.mockReturnValue(Promise.resolve({ data: null }));
      const realmThemes = { realm: { testRealm: [{ _id: 'ui/theme-testTheme', primaryColor: '#dddddd' }] } };
      setupTestStore(null, realmThemes);
      const { theme, loadTheme } = useTheme();
      await loadTheme('testRealm', 'ui/theme-testTheme');
      expect(theme.value._id).toBe('ui/theme-testTheme');
    });
  });

  describe('saveTheme', () => {
    it('should add in default values if saved object does not contain them', async () => {
      setupTestStore();
      const saveSpy = jest.spyOn(ThemeApi, 'saveRealmTheme').mockReturnValue(Promise.resolve({ data: { _id: 'ui/theme-testTheme' } }));
      const { saveTheme } = useTheme();
      await saveTheme('testRealm', { _id: 'ui/theme-testTheme' });
      expect(saveSpy).toHaveBeenCalledWith('ui/theme-testTheme', expect.objectContaining({ primaryColor: '#324054', secondaryColor: '#69788b', pageTitle: '#23282e' }));
    });

    it('should save with legacy themes if in legacy mode', async () => {
      ThemeApi.getRealmTheme.mockReturnValue(Promise.resolve({ data: null }));
      ThemeApi.getLegacyThemes.mockReturnValue(Promise.resolve({ data: { realm: { testRealm: [{ _id: 'ui/theme-testTheme', primaryColor: '#dddddd' }] } } }));
      const saveSpy = jest.spyOn(ThemeApi, 'saveLegacyThemes').mockReturnValue(Promise.resolve({ data: { realm: { testRealm: [{ _id: 'ui/theme-testTheme' }] } } }));
      setupTestStore();
      const { loadTheme, saveTheme } = useTheme();
      await loadTheme('testRealm', 'ui/theme-testTheme');
      await saveTheme('testRealm', { _id: 'ui/theme-testTheme' });
      expect(saveSpy).toHaveBeenCalled();
    });
  });
});
