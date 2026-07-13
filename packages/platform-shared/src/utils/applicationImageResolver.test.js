/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import store from '@/store';
import { resolveImage, onImageError } from './applicationImageResolver';

describe('applicationImageResolver', () => {
  describe('resolveImage', () => {
    beforeAll(() => {
      process.env.BASE_URL = '/';
    });

    afterEach(() => {
      store.state.SharedStore.isAirGapped = false;
    });

    afterAll(() => {
      delete process.env.BASE_URL;
    });

    it('should return CDN URL in standard deployments', () => {
      expect(resolveImage('app-bookmark.svg')).toBe(
        'https://cdn.forgerock.com/platform/app-templates/images/app-bookmark.svg',
      );
    });

    it('should return local path when air-gapped', () => {
      store.state.SharedStore.isAirGapped = true;
      expect(resolveImage('app-bookmark.svg')).toBe('/app-templates/images/app-bookmark.svg');
    });
  });

  describe('onImageError', () => {
    it('should clear onerror and set fallback src when event.target exists', () => {
      const target = { src: 'original.svg', onerror: jest.fn() };
      onImageError({ target });
      expect(target.onerror).toBeNull();
      expect(target.src).not.toBe('original.svg');
    });

    it('should do nothing when event.target is null', () => {
      expect(() => onImageError({ target: null })).not.toThrow();
    });
  });
});
