/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import store from '@/store';
import { buildAmBaseUrl, buildWellknownUrl, normalizeRealm } from './amUrlUtils';

describe('normalizeRealm', () => {
  it('returns the realm unchanged when no leading slash', () => {
    expect(normalizeRealm('alpha')).toBe('alpha');
  });

  it('strips a single leading slash', () => {
    expect(normalizeRealm('/alpha')).toBe('alpha');
  });

  it('strips multiple leading slashes', () => {
    expect(normalizeRealm('//alpha')).toBe('alpha');
  });

  it('falls back to root when passed undefined', () => {
    expect(normalizeRealm(undefined)).toBe('root');
  });

  it('falls back to root when passed null', () => {
    expect(normalizeRealm(null)).toBe('root');
  });

  it('falls back to root when passed an empty string', () => {
    expect(normalizeRealm('')).toBe('root');
  });

  it('falls back to root when passed only slashes', () => {
    expect(normalizeRealm('/')).toBe('root');
  });

  it('returns root unchanged', () => {
    expect(normalizeRealm('root')).toBe('root');
  });
});

describe('buildWellknownUrl', () => {
  it('produces the canonical single-slash discovery URL', () => {
    jest.spyOn(store, 'state', 'get').mockReturnValue({ SharedStore: { amBaseURL: 'https://am.example.com/am' } });
    expect(buildWellknownUrl('root')).toBe(
      'https://am.example.com/am/oauth2/realms/root/.well-known/openid-configuration',
    );
  });

  it('produces the canonical single-slash discovery URL when amBaseURL has a trailing slash', () => {
    jest.spyOn(store, 'state', 'get').mockReturnValue({ SharedStore: { amBaseURL: 'https://am.example.com/am/' } });
    expect(buildWellknownUrl('root')).toBe(
      'https://am.example.com/am/oauth2/realms/root/.well-known/openid-configuration',
    );
  });

  it('preserves the AM sub-path prefix and substitutes the realm', () => {
    jest.spyOn(store, 'state', 'get').mockReturnValue({ SharedStore: { amBaseURL: 'https://am.example.com/am' } });
    expect(buildWellknownUrl('alpha')).toBe(
      'https://am.example.com/am/oauth2/realms/alpha/.well-known/openid-configuration',
    );
  });

  it('never produces a double slash before /oauth2', () => {
    jest.spyOn(store, 'state', 'get').mockReturnValue({ SharedStore: { amBaseURL: 'https://am.example.com/am' } });
    expect(buildWellknownUrl('root')).not.toMatch(/\/\/oauth2/);
  });
});

describe('buildAmBaseUrl', () => {
  it('returns the store value unchanged', () => {
    jest.spyOn(store, 'state', 'get').mockReturnValue({ SharedStore: { amBaseURL: 'https://am.example.com/am' } });
    expect(buildAmBaseUrl()).toBe('https://am.example.com/am');
  });

  it('preserves a trailing slash rather than trimming it', () => {
    jest.spyOn(store, 'state', 'get').mockReturnValue({ SharedStore: { amBaseURL: 'https://am.example.com/am/' } });
    expect(buildAmBaseUrl()).toBe('https://am.example.com/am/');
  });
});
