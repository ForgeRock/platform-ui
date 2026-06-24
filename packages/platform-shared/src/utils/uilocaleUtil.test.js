/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as UilocaleApi from '../api/UilocaleApi';
import { filterActiveLocales } from './uilocaleUtil';

jest.mock('../api/UilocaleApi');

describe('filterActiveLocales', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('always keeps en regardless of its status', async () => {
    UilocaleApi.getTranslationOverrideByLocale.mockResolvedValue({ data: { _meta: { status: false } } });
    const result = await filterActiveLocales(['en']);
    expect(result).toEqual(['en']);
    expect(UilocaleApi.getTranslationOverrideByLocale).not.toHaveBeenCalled();
  });

  it('keeps a locale when _meta.status is true', async () => {
    UilocaleApi.getTranslationOverrideByLocale.mockResolvedValue({ data: { _meta: { status: true } } });
    const result = await filterActiveLocales(['fr']);
    expect(result).toEqual(['fr']);
  });

  it('keeps a locale when _meta.status is undefined', async () => {
    UilocaleApi.getTranslationOverrideByLocale.mockResolvedValue({ data: { _meta: {} } });
    const result = await filterActiveLocales(['de']);
    expect(result).toEqual(['de']);
  });

  it('keeps a locale when _meta is absent', async () => {
    UilocaleApi.getTranslationOverrideByLocale.mockResolvedValue({ data: {} });
    const result = await filterActiveLocales(['es']);
    expect(result).toEqual(['es']);
  });

  it('filters out a locale when _meta.status is false', async () => {
    UilocaleApi.getTranslationOverrideByLocale.mockResolvedValue({ data: { _meta: { status: false } } });
    const result = await filterActiveLocales(['fr']);
    expect(result).toEqual([]);
  });

  it('keeps a locale when the API call throws', async () => {
    UilocaleApi.getTranslationOverrideByLocale.mockRejectedValue(new Error('network error'));
    const result = await filterActiveLocales(['fr']);
    expect(result).toEqual(['fr']);
  });

  it('handles a mix of active, inactive, and erroring locales', async () => {
    UilocaleApi.getTranslationOverrideByLocale.mockImplementation((locale) => {
      if (locale === 'fr') return Promise.resolve({ data: { _meta: { status: true } } });
      if (locale === 'de') return Promise.resolve({ data: { _meta: { status: false } } });
      if (locale === 'es') return Promise.reject(new Error('network error'));
      return Promise.resolve({ data: {} });
    });
    const result = await filterActiveLocales(['en', 'fr', 'de', 'es']);
    expect(result).toEqual(['en', 'fr', 'es']);
  });
});
