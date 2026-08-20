/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import store from '@/store';
import {
  applyThemeAssetRewrites,
  rewriteThemeCdnUrl,
  rewriteThemeCdnUrlsInHtml,
  setUniqueThemeName,
} from './themeUtils';

describe('themeUtil', () => {
  describe('rewriteThemeCdnUrl', () => {
    beforeEach(() => {
      process.env.BASE_URL = '/';
    });

    afterEach(() => {
      store.state.SharedStore.isAirGapped = false;
      delete process.env.BASE_URL;
    });

    it('rewrites a themes CDN URL to the local static asset when air-gapped', () => {
      store.state.SharedStore.isAirGapped = true;
      expect(rewriteThemeCdnUrl('https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg'))
        .toBe('/themes/starter/logo-starter.svg');
    });

    it('preserves the sub-path for any theme name when air-gapped', () => {
      store.state.SharedStore.isAirGapped = true;
      expect(rewriteThemeCdnUrl('https://cdn.forgerock.com/platform/themes/robroy/logo-robroy-full.svg'))
        .toBe('/themes/robroy/logo-robroy-full.svg');
    });

    it('includes the BASE_URL prefix in the rewritten path', () => {
      store.state.SharedStore.isAirGapped = true;
      process.env.BASE_URL = '/platform/';
      expect(rewriteThemeCdnUrl('https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg'))
        .toBe('/platform/themes/starter/logo-starter.svg');
    });

    it('returns the value unchanged when not air-gapped', () => {
      store.state.SharedStore.isAirGapped = false;
      const url = 'https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg';
      expect(rewriteThemeCdnUrl(url)).toBe(url);
    });

    it('does not rewrite app-templates CDN URLs even when air-gapped', () => {
      store.state.SharedStore.isAirGapped = true;
      const url = 'https://cdn.forgerock.com/platform/app-templates/images/default.svg';
      expect(rewriteThemeCdnUrl(url)).toBe(url);
    });

    it('does not rewrite arbitrary customer URLs even when air-gapped', () => {
      store.state.SharedStore.isAirGapped = true;
      const url = 'https://example.com/customer-logo.png';
      expect(rewriteThemeCdnUrl(url)).toBe(url);
    });

    it('returns non-string values unchanged', () => {
      store.state.SharedStore.isAirGapped = true;
      expect(rewriteThemeCdnUrl(undefined)).toBeUndefined();
      expect(rewriteThemeCdnUrl(null)).toBeNull();
      expect(rewriteThemeCdnUrl('')).toBe('');
      const localeObject = { en: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg' };
      expect(rewriteThemeCdnUrl(localeObject)).toBe(localeObject);
    });
  });

  describe('rewriteThemeCdnUrlsInHtml', () => {
    beforeEach(() => {
      process.env.BASE_URL = '/';
    });

    afterEach(() => {
      store.state.SharedStore.isAirGapped = false;
      delete process.env.BASE_URL;
    });

    it('rewrites a CDN URL inside an img src attribute', () => {
      store.state.SharedStore.isAirGapped = true;
      const html = '<img src="https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg" alt="logo">';
      const result = rewriteThemeCdnUrlsInHtml(html);
      expect(result).toBe('<img src="/themes/starter/logo-starter.svg" alt="logo">');
      expect(result).not.toContain('cdn.forgerock.com');
    });

    it('does not consume the closing > when URL is immediately followed by a tag boundary', () => {
      store.state.SharedStore.isAirGapped = true;
      const html = '<img src="https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg">';
      const result = rewriteThemeCdnUrlsInHtml(html);
      expect(result).toBe('<img src="/themes/starter/logo-starter.svg">');
    });

    it('rewrites multiple CDN URLs in a single HTML string', () => {
      store.state.SharedStore.isAirGapped = true;
      const html = '<img src="https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg"><img src="https://cdn.forgerock.com/platform/themes/starter/logo-starter-full.svg">';
      const result = rewriteThemeCdnUrlsInHtml(html);
      expect(result).toContain('/themes/starter/logo-starter.svg');
      expect(result).toContain('/themes/starter/logo-starter-full.svg');
      expect(result).not.toContain('cdn.forgerock.com');
    });

    it('rewrites a CDN URL inside a CSS background-image: url(...)', () => {
      store.state.SharedStore.isAirGapped = true;
      const html = '<div style="background-image: url(https://cdn.forgerock.com/platform/themes/zardoz/background-zardoz.png)"></div>';
      const result = rewriteThemeCdnUrlsInHtml(html);
      expect(result).toBe('<div style="background-image: url(/themes/zardoz/background-zardoz.png)"></div>');
    });

    it('rewrites an SVG illustration asset embedded in HTML', () => {
      store.state.SharedStore.isAirGapped = true;
      const html = '<img src="https://cdn.forgerock.com/platform/themes/robroy/illustration-robroy.svg" class="w-100">';
      const result = rewriteThemeCdnUrlsInHtml(html);
      expect(result).toBe('<img src="/themes/robroy/illustration-robroy.svg" class="w-100">');
    });

    it('returns the HTML unchanged when not air-gapped', () => {
      store.state.SharedStore.isAirGapped = false;
      const html = '<img src="https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg">';
      expect(rewriteThemeCdnUrlsInHtml(html)).toBe(html);
    });

    it('returns empty string unchanged', () => {
      store.state.SharedStore.isAirGapped = true;
      expect(rewriteThemeCdnUrlsInHtml('')).toBe('');
    });

    it('returns non-string values unchanged', () => {
      store.state.SharedStore.isAirGapped = true;
      expect(rewriteThemeCdnUrlsInHtml(undefined)).toBeUndefined();
      expect(rewriteThemeCdnUrlsInHtml(null)).toBeNull();
      const obj = { en: '<img src="https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg">' };
      expect(rewriteThemeCdnUrlsInHtml(obj)).toBe(obj);
    });

    it('does not rewrite app-templates CDN URLs', () => {
      store.state.SharedStore.isAirGapped = true;
      const html = '<img src="https://cdn.forgerock.com/platform/app-templates/images/default.svg">';
      expect(rewriteThemeCdnUrlsInHtml(html)).toBe(html);
    });

    it('rewrites an unknown theme CDN URL to a local path (file may not exist)', () => {
      store.state.SharedStore.isAirGapped = true;
      const html = '<img src="https://cdn.forgerock.com/platform/themes/unknown-theme/logo-unknown.svg">';
      expect(rewriteThemeCdnUrlsInHtml(html))
        .toBe('<img src="/themes/unknown-theme/logo-unknown.svg">');
    });
  });

  describe('applyThemeAssetRewrites', () => {
    beforeEach(() => {
      process.env.BASE_URL = '/';
    });

    afterEach(() => {
      store.state.SharedStore.isAirGapped = false;
      delete process.env.BASE_URL;
    });

    it('rewrites the five asset fields and preserves other fields, without mutating the input', () => {
      store.state.SharedStore.isAirGapped = true;
      const theme = {
        backgroundImage: 'https://cdn.forgerock.com/platform/themes/zardoz/background-zardoz.png',
        favicon: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg',
        logo: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg',
        logoProfile: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter-full.svg',
        logoProfileCollapsed: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg',
        primaryColor: '#324054',
      };
      const result = applyThemeAssetRewrites(theme);

      expect(result.backgroundImage).toBe('/themes/zardoz/background-zardoz.png');
      expect(result.favicon).toBe('/themes/starter/logo-starter.svg');
      expect(result.logo).toBe('/themes/starter/logo-starter.svg');
      expect(result.logoProfile).toBe('/themes/starter/logo-starter-full.svg');
      expect(result.logoProfileCollapsed).toBe('/themes/starter/logo-starter.svg');
      expect(result.primaryColor).toBe('#324054');
      expect(theme.favicon).toBe('https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg');
    });

    it('returns the fields unchanged when not air-gapped', () => {
      store.state.SharedStore.isAirGapped = false;
      const theme = {
        favicon: 'https://cdn.forgerock.com/platform/themes/starter/logo-starter.svg',
      };
      expect(applyThemeAssetRewrites(theme).favicon).toBe(theme.favicon);
    });
  });

  it('sets a unique theme id with setUniqueThemeName', () => {
    const themeData = {
      _id: '123-456-789',
      name: 'TestTheme',
      backgroundColor: '#FFFFFF',
      isDefault: false,
      journeyFooterScriptTag: '',
    };
    const themeRealm = {
      realm: {
        testRealm: [
          {
            _id: '123-456-790',
            name: 'TestTheme',
            backgroundColor: '#FFFFFF',
            isDefault: false,
            journeyFooterScriptTag: '',
          },
          {
            _id: '987-654-321',
            name: 'AnotherTheme',
            backgroundColor: '#000000',
            isDefault: true,
            journeyFooterScriptTag: '',
          },
        ],
      },
    };
    setUniqueThemeName(themeData, themeRealm, 'testRealm');
    expect(themeData.name).toBe('TestTheme(2)');
  });
});
