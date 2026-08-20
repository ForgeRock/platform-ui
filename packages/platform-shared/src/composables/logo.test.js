/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as ThemeApi from '@forgerock/platform-shared/src/api/ThemeApi';
import store from '@/store';
import { setupTestPinia } from '../utils/testPiniaHelpers';
import useTheme from './theme';
import useLogo from './logo';

describe('logo composable', () => {
  beforeEach(() => {
    process.env.BASE_URL = '/';
  });

  afterEach(() => {
    store.state.SharedStore.isAirGapped = false;
    delete process.env.BASE_URL;
  });

  async function setupLoadedTheme(themeOverrides) {
    ThemeApi.getThemes = jest.fn().mockReturnValue(Promise.resolve({
      data: { result: [{ _id: 'testTheme', primaryColor: '#dddddd', ...themeOverrides }] },
    }));
    setupTestPinia();
    const { loadTheme } = useTheme();
    await loadTheme('testRealm', 'testTheme');
  }

  it('rewrites logoProfile to a local path when air-gapped', async () => {
    store.state.SharedStore.isAirGapped = true;
    await setupLoadedTheme({ logoProfile: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter-full.svg' });
    const { horizontalLogoAttrs } = useLogo();
    expect(horizontalLogoAttrs.value.src).toBe('/themes/starter/logo-starter-full.svg');
  });

  it('rewrites logoProfileCollapsed to a local path when air-gapped', async () => {
    store.state.SharedStore.isAirGapped = true;
    await setupLoadedTheme({ logoProfileCollapsed: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg' });
    const { squareLogoAttrs } = useLogo();
    expect(squareLogoAttrs.value.src).toBe('/themes/starter/logo-starter.svg');
  });

  it('keeps logoProfile pointed at the CDN when not air-gapped', async () => {
    store.state.SharedStore.isAirGapped = false;
    const url = 'https://cdn.forgerock.com/platform/themes/starter/logo-starter-full.svg';
    await setupLoadedTheme({ logoProfile: url });
    const { horizontalLogoAttrs } = useLogo();
    expect(horizontalLogoAttrs.value.src).toBe(url);
  });

  it('does not rewrite a non-themes CDN URL for logoProfileCollapsed', async () => {
    store.state.SharedStore.isAirGapped = true;
    const url = 'https://cdn.forgerock.com/platform/app-templates/images/default.svg';
    await setupLoadedTheme({ logoProfileCollapsed: url });
    const { squareLogoAttrs } = useLogo();
    expect(squareLogoAttrs.value.src).toBe(url);
  });
});
